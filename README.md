Yoroi - Passive Gatherer Informations

###Usage###

1-The basic input

For every command you want to execute, the first two words you have to type into
your shell are
                  ------> "node index.js" <---------

2-Action

Type one of the possible actions (target means IP/Domain):
  - "addD example.com"        -> to insert "example.com" in your DB
  - "importD pathToFile"      -> to add all domains contained in that file
  - "resolveD example.com"    -> to resolve "example.com"
  - "resolveD"                -> to resolve all domains in your DB
  - "resolveFP target"        -> to resolve the SSLCertificate of that target
  - "resolveFP"               -> to resolve the SSLCertificate of all targets in DB
  - "importS"                 -> to import a log of Suricata.
  - "xforceW target"          -> to resolve Whois of that target (using XFORCE)
  - "xforceW"                 -> to resolve Whois of all target in DB (using XFORCE)
  - "cymruW"                  -> to resolve Whois of all target in DB (using CYMRU)

  Queries (date means MM/DD/YYYY):
  - "findW target"            -> to find out all target's Whois
  - "findW target date"       -> to find out target's Whois in a specific date
  - "findW target date from"  -> to find out target's Whois from a specific date
  - "findDR target"           -> to find out target's DomainResolution
  - "findDR target date"      -> to find out target's DomainResolution in a specific date
  - "findDR target date from" -> to find out target's DomainResolution from a specific date
  - "findFP target"           -> to find out target's Fingerprint
  - "findFP target date"      -> to find out target's Fingerprint in a specific date
  - "findFP target date from" -> to find out target's Fingerprint from a specific date

  
