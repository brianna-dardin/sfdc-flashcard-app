public without sharing class ChineseTermController {
    @AuraEnabled
    public static Boolean isCommunity() {
        Id siteId = Site.getSiteId();
        if (siteId != null) {
            return true;
        }
        return false;
    }

    @AuraEnabled
    public static Wrappers.Term getThisTerm(String termId) {
        if (String.isNotBlank(termId)) {
            List<Chinese_Term__c> termList = [SELECT Id, Name, Character__c, Pin_Yin__c, English__c, CreatedDate, Sound_Link__c, Level__c,
                                                    Last_Session_Date__c, Percent_Correct__c, Percent_Incorrect__c, Previous_Level__c,
                                                    Total_Number_Correct__c, Total_Number_Incorrect__c, Total_Number_of_Sessions__c, 
                                                    Is_Active__c, First_Session_Date__c
                                                FROM Chinese_Term__c
                                                WHERE Id =: termId];

            if (!termList.isEmpty()) {
                return new Wrappers.Term(termList[0]);
            }         
        }

        return null;
    }

    @AuraEnabled
    public static List<Wrappers.CardLevel> getTermFlashcards(String termId) {
        List<Wrappers.CardLevel> cardWrapList = new List<Wrappers.CardLevel>();

        if (String.isNotBlank(termId)) {
            List<Chinese_Term__c> termList = [SELECT Id, CreatedDate,
                                                (SELECT Id, New_Level__c, Completed_Date__c
                                                FROM Flashcards__r
                                                WHERE Completed_Date__c != null
                                                AND New_Level__c != null
                                                ORDER BY Completed_Date__c ASC)
                                              FROM Chinese_Term__c
                                              WHERE Id =: termId];

            if (!termList.isEmpty()) {
                Chinese_Term__c thisTerm = termList[0];
                cardWrapList.add(
                    new Wrappers.CardLevel('1', Date.valueOf(thisTerm.CreatedDate))
                );

                for (Flashcard__c card : thisTerm.Flashcards__r) {
                    cardWrapList.add(
                        new Wrappers.CardLevel(card.New_Level__c, card.Completed_Date__c)
                    );
                }
            }
            
        }

        return cardWrapList;
    }

    @AuraEnabled
    public static List<Wrappers.Level> getMyTermLevels(Boolean isGuest, Boolean onlyActive) {
        List<Wrappers.Level> wrapList = new List<Wrappers.Level>();

        String query = 'SELECT Level__c, COUNT(Id) total ';
        query += 'FROM Chinese_Term__c WHERE ';

        if (isGuest) {
            query += 'Guest_Owned__c = true';
        } else {
            query += 'OwnerId = \'' + UserInfo.getUserId() + '\'';
        }

        if (onlyActive) {
            query += ' AND Level__c != \'8\'';
        }

        query += ' GROUP BY Level__c ';
        query += 'ORDER BY Level__c ASC';

        AggregateResult[] groupedResults = Database.query(query);
        Map<String, Integer> levelAmtMap = new Map<String, Integer>();

        for (AggregateResult ar : groupedResults)  {
            String level = (String)ar.get('Level__c');
            Integer total = (Integer)ar.get('total');
            levelAmtMap.put(level, total);
        }

        Integer numLevels = 8;
        if (onlyActive) {
            numLevels = 7;
        }

        for (Integer i = 1; i <= numLevels; i++) {
            String level = String.valueOf(i);
            Integer total = 0;
            if (levelAmtMap.containsKey(level)) {
                total = levelAmtMap.get(level);
            }
            wrapList.add(new Wrappers.Level(level, total));
        }

        return wrapList;
    }

    @AuraEnabled
    public static List<Wrappers.Term> getMyTerms(Boolean isGuest) {
        List<Wrappers.Term> wrapList = new List<Wrappers.Term>();

        String query = 'SELECT Id, Name, Character__c, Pin_Yin__c, English__c, CreatedDate, Sound_Link__c, Level__c, ';
        query += 'Last_Session_Date__c, Percent_Correct__c, Percent_Incorrect__c, Previous_Level__c, Total_Number_Correct__c, ';
        query += 'Total_Number_Incorrect__c, Total_Number_of_Sessions__c, Is_Active__c, First_Session_Date__c ';
        query += 'FROM Chinese_Term__c WHERE ';

        if (isGuest) {
            query += 'Guest_Owned__c = true';
        } else {
            query += 'OwnerId = \'' + UserInfo.getUserId() + '\'';
        }

        query += ' ORDER BY CreatedDate DESC';

        List<Chinese_Term__c> termList = Database.query(query);

        for (Chinese_Term__c term : termList) {
            wrapList.add(new Wrappers.Term(term));
        }

        return wrapList;
    }

    @AuraEnabled
    public static Wrappers.Term saveTerm(String termString, Boolean isGuest) {
        Wrappers.Term termWrap = (Wrappers.Term)JSON.deserialize(termString, Wrappers.Term.class);

        Chinese_Term__c term = new Chinese_Term__c();
        term.Character__c = termWrap.character;
        term.Pin_Yin__c = termWrap.pinYin;
        term.English__c = termWrap.english;

        if (String.isNotBlank(termWrap.termId)) {
            term.Id = termWrap.termId;
            term.Is_Active__c = termWrap.isActive;
        }

        if (isGuest) {
            term.Guest_Owned__c = true;
        }

        try {
            upsert term;

            termWrap.termId = term.Id;
            return termWrap;
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }
    }

    @AuraEnabled
    public static void saveAttachment(String termId, String fileName, String base64Data) {
        ContentVersion contentInsert = new ContentVersion(); 
        contentInsert.Title = fileName; 
        contentInsert.VersionData = EncodingUtil.base64Decode(base64Data);
        contentInsert.PathOnClient = '/' + fileName ;
        try {
            insert contentInsert;
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }
        
        contentInsert = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentInsert.Id];
        ContentDocumentLink contentLink = new ContentDocumentLink();
        contentLink.ContentDocumentId = contentInsert.ContentDocumentId;
        contentLink.LinkedEntityId = Id.valueOf(termId);
        contentLink.ShareType = 'V';
        contentLink.Visibility = 'AllUsers';
        try {
            insert contentLink;
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }

        Chinese_Term__c term = new Chinese_Term__c();
        term.Id = Id.valueOf(termId);
        term.Sound_Link__c = '/sfc/servlet.shepherd/version/download/' + contentInsert.Id + '?asPdf=false&operationContext=CHATTER';
        try {
            update term;
        } catch (Exception ex) {
            throw new AuraException(ex.getMessage() + ', Line ' + ex.getLineNumber());
        }
    }
}