Feature('First test');


Scenario('test index', (I) => {
  I.amOnPage('/index');
  I.see('pass');
});
