public without sharing class TRIG_SessionHandler {
    public static void afterInsert(List<Session__c> triggerNew) {
        Set<String> levels = new Set<String>();
        Set<Id> ownerIds = new Set<Id>();

        for (Session__c sess : triggerNew) {
            if (String.isNotBlank(sess.Levels__c)) {
                List<String> allLevelsList = sess.Levels__c.split(';');
                levels.addAll(allLevelsList);
            }

            ownerIds.add(sess.CreatedById);
        }

        if (!levels.isEmpty() && !ownerIds.isEmpty()) {
            List<User> guestList = [SELECT Id 
                                    FROM User 
                                    WHERE Profile.Name LIKE 'Chinese Flashcards%' 
                                    AND UserType = 'Guest'];

            Id guestId;
            if (!guestList.isEmpty()) {
                if (ownerIds.contains(guestList[0].Id)) {
                    guestId = guestList[0].Id;
                }
            }

            String query = 'SELECT Id, Level__c, OwnerId, Guest_Owned__c ';
            query += 'FROM Chinese_Term__c ';
            query += 'WHERE Is_Active__c = true AND Level__c IN :levels ';
            query += 'AND (Last_Session_Date__c = null OR Last_Session_Date__c < TODAY) ';

            if (guestId != null) {
                query += 'AND (Guest_Owned__c = true OR OwnerId IN :ownerIds)';
            } else {
                query += 'AND OwnerId IN :ownerIds';
            }

            query += ' ORDER BY Level__c DESC NULLS LAST, CreatedDate ASC';

            List<Chinese_Term__c> termList = Database.query(query);

            Map<Id, Map<String, List<Chinese_Term__c>>> levelTermMap = new Map<Id, Map<String, List<Chinese_Term__c>>>();

            for (Chinese_Term__c term : termList) {
                Id userId;
                if (term.Guest_Owned__c) {
                    userId = guestId;
                } else {
                    userId = term.OwnerId;
                }

                if (levelTermMap.containsKey(userId)) {
                    Map<String, List<Chinese_Term__c>> levelMap = levelTermMap.get(userId);

                    if (levelMap.containsKey(term.Level__c)) {
                        levelMap.get(term.Level__c).add(term);
                    } else {
                        levelMap.put(term.Level__c, new List<Chinese_Term__c>{term});
                    }

                    levelTermMap.put(userId, levelMap);
                } else {
                    Map<String, List<Chinese_Term__c>> levelMap = new Map<String, List<Chinese_Term__c>>{term.Level__c => new List<Chinese_Term__c>{term}};
                    levelTermMap.put(userId, levelMap);
                }
            }

            List<Flashcard__c> cardsToInsert = new List<Flashcard__c>();

            for (Session__c sess : triggerNew) {
                if (levelTermMap.containsKey(sess.CreatedById)) {
                    Map<String, List<Chinese_Term__c>> levelMap = levelTermMap.get(sess.CreatedById);
                    List<String> allLevelsList = sess.Levels__c.split(';');

                    for (String level : allLevelsList) {
                        if (levelMap.containsKey(level)) {
                            List<Chinese_Term__c> terms = levelMap.get(level);

                            for (Integer i = 0; i < terms.size(); i++) {
                                if (sess.Number_of_Cards_Drawn__c < (i + 1)
                                        && level == '1') {
                                    break;
                                }

                                Flashcard__c card = new Flashcard__c();
                                card.Session__c = sess.Id;
                                card.Chinese_Term__c = terms[i].Id;
                                cardsToInsert.add(card);
                            }
                        }
                    }
                }
            }

            if (!cardsToInsert.isEmpty()) {
                insert cardsToInsert;
            }
        }
    }
}