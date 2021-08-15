@isTest
private class TRIG_SessionHandlerTest {
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

        Session__c sess = new Session__c();
        sess.Deck_Front__c = 'Character';
        sess.Number_of_Cards_Drawn__c = 10;
        sess.Deck_Session_Number__c = 1;
        sess.Levels__c = '1';
        sess.Guest_Owned__c = isGuest;
        insert sess;

        Test.stopTest();
    }
}