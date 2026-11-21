// EP14 scene driver. Character designs, hands, props and kitchen come from the original series modules.
import * as T from './toon.js';
import {P} from './parts.js';
import {papi,leo} from './people.js';
import {drawBG,hangingPans,wallClock,flourJar} from './kitchen.js';
import * as ST from './story.js';
import {makeEpisode} from '../papi-serieux-batch12-18/scenes-core.js';
export const {initScenes,drawScene,subtitles}=makeEpisode({T,P,papi,leo,drawBG,hangingPans,wallClock,flourJar,ST});
