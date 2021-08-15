@isTest
private class ChineseTermControllerTest {
    @isTest
    static void mainTest() {
        Boolean isGuest = false;
        runTest(isGuest);
    }

    @isTest
    static void guestTest() {
        Boolean isGuest = true;
        runTest(isGuest);
    }

    static void runTest(Boolean isGuest) {
        Chinese_Term__c term = new Chinese_Term__c();
        term.Character__c = 'Character';
        term.Pin_Yin__c = 'PinYin';
        term.English__c = 'English';
        term.Guest_Owned__c = isGuest;
        insert term;

        Session__c sess = new Session__c();
        sess.Deck_Session_Number__c = 1;
        sess.Number_of_Cards_Drawn__c = 1;
        sess.Levels__c = '1';
        sess.Completed_Date__c = System.today();
        insert sess;

        List<Flashcard__c> cardList = [SELECT Id FROM Flashcard__c];
        for (Flashcard__c card : cardList) {
            card.Number_of_Times_Incorrect__c = 0;
            card.Original_Level__c = '1';
            card.New_Level__c = '2';
            card.Completed_Date__c = System.today();
        }
        update cardList;

        Test.startTest();

        Boolean isComm = ChineseTermController.isCommunity();
        List<Wrappers.Term> termWrapList = ChineseTermController.getMyTerms(isGuest);

        Wrappers.Term thisTerm = ChineseTermController.getThisTerm(term.Id);
        Wrappers.Term savedTerm = ChineseTermController.saveTerm(JSON.serialize(thisTerm), isGuest);

        List<Wrappers.CardLevel> cardLevelList = ChineseTermController.getTermFlashcards(term.Id);
        List<Wrappers.Level> levelList = ChineseTermController.getMyTermLevels(isGuest, true);

        String fileData = EncodingUtil.base64Encode(Blob.valueOf('This is a test sound file upload!'));
        ChineseTermController.saveAttachment(termWrapList[0].termId, 'audio.mp3', fileData);

        Test.stopTest();
    }
}