@isTest
private class EmailControllerTest {
    @isTest
    static void mainTest() {
        String firstName = 'Brianna';
        String lastName = 'Dardin';
        String formType = 'Chinese Flashcards Registration';
        String fromEmail = 'testuser@briannadardin.com';
        String toEmails = 'brianna.dardin@gmail.com';
        String message = 'This is a test email body';

        Test.startTest();
        EmailController.sendEmail(firstName, lastName, formType, fromEmail, toEmails, message);
        Test.stopTest();
    }
}