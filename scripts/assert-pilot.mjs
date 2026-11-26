import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
assert.equal(config.name,'sabercomun-dev','Unexpected worker');
assert.equal(config.d1_databases.length,2);
assert.deepEqual(config.d1_databases.map(x=>x.binding).sort(),['AUTH_DB','DB']);
for(const db of config.d1_databases){
 assert.equal(db.database_name,'sabercomun-dev');
 assert.equal(db.database_id,'487357a8-ab9e-458b-aaa5-b3b38beae91b','Unexpected database');
 assert.equal(db.migrations_dir,'pilot-migrations');
}
console.log('Pilot configuration verified: isolated worker and D1.');
