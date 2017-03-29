const mod = new Creep.Behaviour('healer');
module.exports = mod;
mod.run = function(creep) {
  // console.log(creep, 'isMissibng', creep.missingBodyparts());
      creep.flee = ((creep.flee) || (!creep.hasActiveBodyparts([HEAL])) || (creep.data.destiny.squad && creep.missingBodyparts() > 5));
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if( creep.action == null || ['guarding','idle'].includes(creep.action.name)) {
        this.nextAction(creep);
    }
    
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.actions = (creep) => {
    return [
      
      Creep.action.healing,
      Creep.action.invading,
      Creep.action.boosting,
      Creep.action.staging,
      Creep.action.guarding,
      Creep.action.idle
    ];
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // // allow routing in and through hostile rooms
            // if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
