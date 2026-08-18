import { Command } from 'commander';

import { create } from './commands/create.js';
import { doctor } from './commands/doctor.js';
import { init } from './commands/init.js';

const program = new Command();

program.name('ku-utils').description('ku-utils 前端团队 CLI 工具').version('0.0.1');

program.command('create <name>').description('创建新项目').action(create);

program.command('init').description('初始化已有项目的 ku-utils 配置').action(init);

program.command('doctor').description('检查项目配置健康度').action(doctor);

program.parse();
