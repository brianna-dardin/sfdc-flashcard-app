public without sharing class SessionController {
    @AuraEnabled
    public static List<Wrappers.Level> getTotalCards(Boolean isGuest) {
        Integer newSessionNum = getSessionNum();
        List<String> levelList = getSessionLevels(newSessionNum);

        String query = 'SELECT Id, Level__c, OwnerId, Guest_Owned__c ';
        query += 'FROM Chinese_Term__c ';
        query += 'WHERE Is_Active__c = true AND Level__c IN :levelList ';
        query += 'AND (Last_Session_Date__c = null OR Last_Session_Date__c < TODAY) ';
        
        if (isGuest) {
            query += 'AND Guest_Owned__c = true';
        } else {
            query += 'AND Guest_Owned__c = false AND OwnerId = \'' + UserInfo.getUserId() + '\'';
        }

        List<Chinese_Term__c> termList = Database.query(query);

        Map<String, Integer> levelMap = new Map<String,Integer>();
        for (String level : levelList) {
            levelMap.put(level, 0);
        }

        for (Chinese_Term__c term : termList) {
            Integer newAmt = levelMap.get(term.Level__c) + 1;
            levelMap.put(term.Level__c, newAmt);
        }

        List<Wrappers.Level> levelWrapList = new List<Wrappers.Level>();
        for (String level : levelList) {
            levelWrapList.add(
                new Wrappers.Level(level, levelMap.get(level))
            );
        }

        return levelWrapList;
    }

    public static Integer getSessionNum() {
        List<Session__c> sessionList = [SELECT Id, Deck_Session_Number__c, Completed_Date__c
                                        FROM Session__c
                                        WHERE Completed_Date__c != null
                                        AND CreatedById =: UserInfo.getUserId()
                                        ORDER BY Completed_Date__c DESC];

        Integer newSessionNum = 1;
        if (!sessionList.isEmpty()) {
            Session__c lastSess = sessionList[0];
            newSessionNum = Integer.valueOf(lastSess.Deck_Session_Number__c);

            if (lastSess.Completed_Date__c < System.today()) {
                newSessionNum++;
            }
        }

        return newSessionNum;
    }

    public static List<String> getSessionLevels(Integer newSessionNum) {
        List<String> levelList = new List<String>{'1'};

        if (Math.mod(newSessionNum, 2) > 0) {
            levelList.add('2');
        }

        if (Math.mod(newSessionNum - 2, 4) == 0) {
            levelList.add('3');
        }

        if (Math.mod(newSessionNum - 4, 8) == 0) {
            levelList.add('4');
        }

        if (Math.mod(newSessionNum - 8, 16) == 0) {
            levelList.add('5');
        }

        if (Math.mod(newSessionNum, 32) == 0) {
            levelList.add('6');
        }

        if (Math.mod(newSessionNum, 16) == 0 && Math.mod(newSessionNum / 16, 2) > 0) {
            levelList.add('7');
        }

        return levelList;
    }

    @AuraEnabled
    public static String createSession(String deckType, Integer numberNewCards, Boolean isGuest) {
        Session__c sess = new Session__c();
        sess.Deck_Front__c = deckType;
        sess.Number_of_Cards_Drawn__c = numberNewCards;
        
        if (isGuest != null && isGuest) {
            sess.Guest_Owned__c = true;
        }

        Integer newSessionNum = getSessionNum();
        sess.Deck_Session_Number__c = newSessionNum;

        List<String> levelList = getSessionLevels(newSessionNum);
        sess.Levels__c = String.join(levelList, ';');

        try {
            insert sess;
            return sess.Id;
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }
    }

    @AuraEnabled
    public static List<Wrappers.Session> getMySessions() {
        List<Session__c> sessionList = [SELECT Id, Name, Deck_Front__c, Completed_Date__c, Total_Number_of_Cards__c, 
                                        Total_Number_Correct__c, Total_Number_Incorrect__c, Levels__c, Number_of_Cards_Drawn__c
                                        FROM Session__c
                                        WHERE CreatedById =: UserInfo.getUserId()
                                        ORDER BY Completed_Date__c DESC];

        List<Wrappers.Session> sessWrapList = new List<Wrappers.Session>();

        for (Session__c sess : sessionList) {
            sessWrapList.add(new Wrappers.Session(sess, new List<Wrappers.Flashcard>()));
        }

        return sessWrapList;
    }

    @AuraEnabled
    public static Wrappers.Session getFlashcards(String sessionId) {
        if (String.isNotBlank(sessionId)) {
            List<Session__c> sessionList = [SELECT Id, Name, Deck_Front__c, Number_of_Cards_Drawn__c, Completed_Date__c, Levels__c,
                                                    Total_Number_of_Cards__c, Total_Number_Correct__c, Total_Number_Incorrect__c,
                                                (SELECT Id, Chinese_Term__r.Id, Chinese_Term__r.Character__c,
                                                    Chinese_Term__r.English__c, Chinese_Term__r.Pin_Yin__c, 
                                                    Chinese_Term__r.Sound_Link__c, Chinese_Term__r.Level__c,
                                                    Chinese_Term__r.CreatedDate, Chinese_Term__r.Last_Session_Date__c, 
                                                    Chinese_Term__r.Percent_Correct__c, Chinese_Term__r.Percent_Incorrect__c,
                                                    Chinese_Term__r.Total_Number_Correct__c, Chinese_Term__r.Total_Number_Incorrect__c, 
                                                    Chinese_Term__r.Total_Number_of_Sessions__c, Chinese_Term__r.Previous_Level__c,
                                                    Chinese_Term__r.Is_Active__c, Chinese_Term__r.First_Session_Date__c,
                                                    Chinese_Term__r.Name, Original_Level__c, New_Level__c, Number_of_Times_Incorrect__c
                                                FROM Flashcards__r
                                                WHERE Chinese_Term__r.Is_Active__c = true
                                                ORDER BY Original_Level__c ASC, New_Level__c ASC)
                                            FROM Session__c
                                            WHERE Id =: sessionId];

            if (!sessionList.isEmpty()) {
                List<Wrappers.Flashcard> cardWrapperList = new List<Wrappers.Flashcard>();

                for (Flashcard__c card : sessionList[0].Flashcards__r) {
                    cardWrapperList.add(new Wrappers.Flashcard(card, sessionList[0].Deck_Front__c));
                }

                if (!cardWrapperList.isEmpty()) {
                    if (sessionList[0].Completed_Date__c == null) {
                        cardWrapperList = randomize(cardWrapperList);
                    }
                }

                return new Wrappers.Session(sessionList[0], cardWrapperList);
            }
        }

        return null;
    }

    private static List<Wrappers.Flashcard> randomize(List<Wrappers.Flashcard> cardWrapperList) {
        Integer currentIndex = cardWrapperList.size();
        Wrappers.Flashcard card;
        Integer randomIndex;

        while (currentIndex > 0) {
            randomIndex = Integer.valueOf(Math.floor(Math.random() * currentIndex));
            currentIndex -= 1;

            card = cardWrapperList[currentIndex];
            cardWrapperList[currentIndex] = cardWrapperList[randomIndex];
            cardWrapperList[randomIndex] = card;
        }

        return cardWrapperList;
    }

    @AuraEnabled
    public static void deleteSession(String sessionId) {
        if (String.isNotBlank(sessionId)) {
            try {
                Session__c sess = new Session__c(Id = sessionId);
                delete sess;
            } catch (Exception ex) {
                throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
            }
        }
    }

    @AuraEnabled
    public static void endSession(String sessionString) {
        Wrappers.Session sessWrap = (Wrappers.Session)JSON.deserialize(sessionString, Wrappers.Session.class);

        List<Chinese_Term__c> termsToUpdate = new List<Chinese_Term__c>();
        List<Flashcard__c> cardsToUpdate = new List<Flashcard__c>();
        Date today = System.today();

        for (Wrappers.Flashcard card : sessWrap.flashcards) {
            Wrappers.Term termWrap = card.term;
            String newLevel = String.valueOf(Integer.valueOf(termWrap.level) + 1);
            if (card.numIncorrect > 0) {
                newLevel = '2';
            }

            Chinese_Term__c updatedTerm = new Chinese_Term__c();
            updatedTerm.Id = termWrap.termId;
            updatedTerm.Level__c = newLevel;
            termsToUpdate.add(updatedTerm);

            Flashcard__c updatedCard = new Flashcard__c();
            updatedCard.Id = card.cardId;
            updatedCard.Number_of_Times_Incorrect__c = card.numIncorrect;
            updatedCard.Original_Level__c = termWrap.level;
            updatedCard.New_Level__c = newLevel;
            updatedCard.Completed_Date__c = today;
            cardsToUpdate.add(updatedCard);
        }

        try {
            Session__c sess = new Session__c();
            sess.Id = sessWrap.sessId;
            sess.Completed_Date__c = today;
            update sess;

            if (!termsToUpdate.isEmpty()) {
                update termsToUpdate;
            }

            if (!cardsToUpdate.isEmpty()) {
                update cardsToUpdate;
            }
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }
    }
}