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
I.amOnPage('https://github.com');
within('.form-signup-home', function() {
  I.fillField('user[login]', 'User');
  I.fillField('user[email]', 'user@user.com');
  I.fillField('user[password]', 'user@user.com');
  I.click('button');
});
I.see('There were problems creating your account.');
