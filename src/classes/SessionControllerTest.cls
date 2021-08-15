@isTest
private class SessionControllerTest {
    @isTest
    static void mainTest() {
        Boolean isGuest = false;
        runTest(isGuest);
    }

    @isTest
    static void guestTest() {
        List<User> userList = [SELECT Id, UserType 
                                FROM User 
                                WHERE Profile.Name LIKE 'Chinese Flashcards%' 
                                AND UserType = 'Guest'];

        System.runAs(userList[0]) {
            Boolean isGuest = true;
            runTest(isGuest);
        }
    }

    static void runTest(Boolean isGuest) {
        Session__c sess = new Session__c();
        sess.Deck_Session_Number__c = 1;
        sess.Completed_Date__c = System.today().addDays(-1);
        insert sess;

        List<Chinese_Term__c> terms = new List<Chinese_Term__c>();

        for (Integer i = 0; i < 20; i++) {
            Chinese_Term__c term = new Chinese_Term__c();
            term.Character__c = 'Character' + i;
            term.Pin_Yin__c = 'PinYin' + i;
            term.English__c = 'English' + i;
            term.Guest_Owned__c = isGuest;
            terms.add(term);
        }

        insert terms;

        Test.startTest();

        List<Integer> testNumbers = new List<Integer>{1,6,12,24,32,65};
        for (Integer num : testNumbers) {
            SessionController.getSessionLevels(num);
        }

        String sessionId = SessionController.createSession('Character', terms.size(), isGuest);
        Wrappers.Session sessWrap = SessionController.getFlashcards(sessionId);

        List<Wrappers.Session> sessList = SessionController.getMySessions();
        List<Wrappers.Level> levels = SessionController.getTotalCards(isGuest);

        SessionController.endSession(JSON.serialize(sessWrap));
        SessionController.deleteSession(sessionId);

        Test.stopTest();
    }
}