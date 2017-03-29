let mod = {};
module.exports = mod;
mod.segmentsChanged = true;
mod.numSaved = 0;
mod.activateSegments = () => {
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	let activeSegments = [];
	for (const id in Memory.activeSegments) {
		activeSegments.push(id);
	}
	RawMemory.setActiveSegments(activeSegments);
};
mod.activateSegment = (id) => {
	if (id < 0 || id > 99) return logError('RawMemory', 'cannot activate invalid segment ' + id);
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	const numActive = _.size(Memory.activeSegments);
	if (numActive >= 10) return logError('RawMemory', '10 segments loaded, cannot activate segment ' + id);
	if (mod.numSaved >= 10) return logError('RawMemory', '10 segments saved, cannot activate segment ' + id);
	if (numActive + mod.numSaved >= 10) return logError('RawMemory', 'combined loaded and saved exceeds limit(10), cannot activate segment ' + id);
	Memory.activeSegments[id] = true;
	mod.segmentsChanged = true;
};
mod.deactivateSegment = (id) => {
	if (id < 0 || id > 99) return logError('RawMemory', 'cannot deactivate invalid segment ' + id);
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	delete Memory.activeSegments[id];
	mod.segmentsChanged = true;
};
mod.cacheValid = (id) => {
	return global.cacheValid[id] === Memory.cacheValid[id];
};
mod.processSegment = (id, process) => {
	if (_.isUndefined(Memory.cacheValid[id])) Memory.cacheValid[id] = false;
	const segment = RawMemory.segments[id];
	if (!mod.cacheValid(id)) {
		try {
			const data = segment ? JSON.parse(segment) : '';
			process(data);
			global.cacheValid[id] = Memory.cacheValid[id];
		} catch (e) {
            console.log('<font style="color:FireBrick">Error loading segment' + id
                + ' caused by ' + (e.stack || e.toString()) + '</font>');
			RawMemory.segments[id] = '';
			delete global.cacheValid[id];
			delete Memory.cacheValid[id];
		}
	}
};
mod.processSegments = () => {
	if (_.isUndefined(global.cacheValid)) global.cacheValid = {};
	if (_.isUndefined(Memory.cacheValid)) Memory.cacheValid = {};

	for (let id = MEM_SEGMENTS.COSTMATRIX_CACHE.start; id <= MEM_SEGMENTS.COSTMATRIX_CACHE.end; id++) {
		mod.processSegment(id, Room.loadCostMatrixCache);
	}
};
mod.saveSegment = (range, inputData) => {
	const numActive = _.size(Memory.activeSegments);
	const keys = Object.keys(inputData);
	let keyNum = 0;
	let encodedData;
	for (let id = range.start; id <= range.end; id++) {
		if (keyNum < keys.length) { // more data to save
			if (RawMemory.segments[id] || numActive + mod.numSaved < 10) {
				let temp;
				while (keyNum < keys.length) {
					const key = keys[keyNum];
					keyNum++;
					const stringified = JSON.stringify(inputData[key]);
					temp = `"${key}":${stringified}`;
					if (!encodedData || (encodedData.length + temp.length + 1) / 1024 < 100) {
	 					encodedData = encodedData ? encodedData + ',' + temp : '{' + temp;
					} else break;
				}
				if (DEBUG) logSystem('OCSMemory.saveSegment', 'Saving ' + _.round(encodedData.length / 1024, 2) + 'kb of data to segment ' + id);
				RawMemory.segments[id] = encodedData + '}';
				Memory.cacheValid[id] = Game.time;
				encodedData = '{' + temp;
				if (!Memory.activeSegments[id]) mod.numSaved++;
			} else if (numActive >= 10) {
				// TODO: also defer?
				return logError('RawMemory', 'cannot save segment ' + id + ' too many active segments.');
			} else if (numActive + mod.numSaved >= 10) {
				// TODO: defer one tick?
				return logError('RawMemory', 'cannot save segment ' + id + ' loaded + saved exceeds limit(10).');
			} else {
				logError('RawMemory', 'should not be here.');
			}
		} else if (Memory.cacheValid[id]) { // no more data, clear this segment
			if (DEBUG) logSystem('OCSMemory.saveSegment', 'clearing unused segment ' + id);
			RawMemory.segments[id] = '';
			delete Memory.cacheValid[id];
		}
	}
};
mod.cleanup = () => {
	if (mod.segmentsChanged) mod.activateSegments();
	mod.numSaved = 0;
	mod.segmentsChanged = false;
};