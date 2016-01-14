Feature('Login');

Scenario('Github authenticate', (I) => {
  I.amOnPage('/login');
  I.click('Sign in with Github');
});


Scenario('Logout', (I) => {
  I.click('Logout');
  I.see('Login');
  //I.dontSeeInCurrentUrl('/login');
});
