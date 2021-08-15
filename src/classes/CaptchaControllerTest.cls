@isTest
private class CaptchaControllerTest {
    @isTest
    static void mainTest() {
        Test.setMock(HttpCalloutMock.class, new CaptchaTestMock());

        Boolean valid = CaptchaController.verifyCaptcha('token');
        System.assert(valid);
    }
}