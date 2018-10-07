var xfe = require("./dist/app");
var xfeClient = new xfe("865db0c3-e192-45f5-94ab-e1d3e685cf0f", "1e760aa7-fa08-47a0-adfc-69c1a5781c79");

xfeClient.collections.create().then(
  function(collection){
    collection.shareWith({email: "dbrugger@de.ibm.com", level: "Alcatraz"}).then(function() {
      console.log(collection.link);
    });
  }
);
