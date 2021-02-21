'use-strict';

import { browserWebPSupport } from './common/browserWebPSupport';
import { modules }            from './import/modules';
import { components }         from './import/components';

browserWebPSupport();

// components and modules code
components();
modules();

console.log('index: its work!');