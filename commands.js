// useful commands

// Army
Army.populateSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}, { type: 'dismanter', count: 1, boosts: [TOUGH]}, ], false, ['W7N3', 'W8N3'], 'W7N3' )
Army.populateSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}], false, ['W7N3', 'W8N3'], 'W7N3' )
Army.populateSquad(`sq${Game.time}`, [{ type: 'melee', count: 1, boosts: [TOUGH, ATTACK]}, { type: 'ranger', count: 1, boosts: [TOUGH]}, { type: 'healer', count: 1, boosts: [TOUGH]}], false, ['W7N3', 'W8N3'], 'W7N3' )

// no boosts, works
Army.populateSquad(`sq${Game.time}`, [{ type: 'melee', count: 1}, { type: 'ranger', count: 1}, { type: 'healer', count: 1}], false, ['W7N3', 'W8N3'], 'W7N3' )
// no melee, works
Army.populateSquad(`sq${Game.time}`, [{ type: 'ranger', count: 1}, { type: 'healer', count: 1}], false, ['W7N3', 'W8N3'], 'W7N3' )
// reinf true, works
Army.populateSquad(`sq${Game.time}`, [{ type: 'ranger', count: 1}, { type: 'healer', count: 1}], true, ['W7N3', 'W8N3'], 'W7N3' )
// name foo
Army.populateSquad(`foo`, [{ type: 'ranger', count: 1}, { type: 'healer', count: 1}], false, ['W7N3', 'W8N3'], 'W7N3' )

// squad tests
Army.populateSquad(`foo`, [{ type: 'ranger', count: 2}, { type: 'healer', count: 2}], true, ['W7N3'], 'W7N3' )

Army.populateSquad(`foo`, [{ type: 'ranger', count: 2}, { type: 'healer', count: 2}], true, ['W7N3', 'W8N3'], 'W7N3' )

Army.populateSquad(`bar`, [{type: 'melee', count: 0},{ type: 'ranger', count: 2}, { type: 'healer', count: 2}], true, ['W7N3', 'W8N3'], 'W7N3' )

Army.clearSquad('');
Army.reinforceSquad('');

// Recycle a creep
Creep.action.recycling.assign(Game.creeps['<creepName>']);

// flush road construction traces
_.forEach(Memory.rooms, r => delete r.roadConstructionTrace);

// remove all construction Sites
_.forEach(Game.constructionSites, s => s.remove());

// spawn something...
Game.spawns['<spawnName>'].createCreepBySetup(Creep.setup.worker);
// or
Game.rooms['<roomName>'].spawnQueueLow.push({parts:[MOVE,WORK,CARRY],name:'max',setup:'worker'});

// clear spawn queues for a room
// clear low priority queue
Memory.rooms['<roomName>'].spawnQueueLow = [0];
// clear medium priority queue
Memory.rooms['<roomName>'].spawnQueueMedium = [0];
// clear high priority queue 
Memory.rooms['<roomName>'].spawnQueueHigh = [0];

// move Creep
Game.creeps['<creepName>'].move(RIGHT);

// force recycle a Creep
Game.creeps['<creepName>'].data.creepType="recycler";

// To override a module file create a copy of an existing module and name it "custom.<originalModuleName>". Then call this method (without ".js"): 
getPath('<originalModuleName>', true);
// To completely re-evaluate all modules:
delete Memory.modules;

// create market order (replace [roomName] with target room or remove it for subscription tokens)
Game.market.createOrder(type, resourceType, price, totalAmount, roomName);

//accept market sell or buy order
Game.market.deal(orderId, amount, roomName);

//flush visuals heatmap
_.forEach(Memory.rooms, r => delete r.heatmap);

// https://github.com/ScreepsOCS/screeps.behaviour-action-pattern/wiki/Resource-Management
//resource management  - stat labs
Game.rooms[<roomName>].placeReactionOrder(<labId>, <resourceId>, <amount>)

//resource management - maintain set amount in container
Game.rooms[<roomName>].setStore(<structure>, <resource>, <amount>)

//resource management - one off amount in container
Game.rooms[<roomName>].placeOrder(<structure>, <resource>, <amount>)
