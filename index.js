const Homey = require('homey');

const util = require('util');

const { transports, format, Container, addColors } = require('winston');
const { combine, printf, colorize } = format;

const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logLevels = {
    levels: {
        trace: 6,
        debug: 5,
        info: 4,
        warn: 3,
        error: 2,
        fatal: 1,
        off: 0
    },
    colors: {
        trace: 'blue',
        debug: 'magenta',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'red',
        off: 'grey'
    }
};

class HomeyLog extends Homey.App {
    constructor(...args) {
        super(...args);

        this.HomeyLogData = {
            logtail: null
        };

        this.HomeyLogData.config = {
            console_enabled: '1',
            publish_enabled: '1',
            console_level: 'info',
            publish_level: 'info'
        };

        if (Homey.env.HOMEY_BETTERSTACK_CONFIG) {
            this.HomeyLogData.config = {
                ...this.HomeyLogData.config,
                ...Homey.env.HOMEY_BETTERSTACK_CONFIG
            };
        }

        this.setupHomeyLogLogtail();
    }

    async setupHomeyLogLogtail() {
        this.HomeyLogData['HomeyId'] = await this.homey.cloud.getHomeyId();

        if (Homey.env.HOMEY_BETTERSTACK_TOKEN) {
            this.HomeyLogData.logtail = new Logtail(Homey.env.HOMEY_BETTERSTACK_TOKEN);
            this.HomeyLogData.logtail.use((data) => ({
                ...data,
                homeyId: this.HomeyLogData['HomeyId']
            }));
        } else {
            console.error('HomeyLog: No Homey log token found. Please add HOMEY_BETTERSTACK_TOKEN to your env.json');
        }

        this.setupHomeyLogLogger();
    }

    async setupHomeyLogLogger() {
        addColors(logLevels.colors);

        this.HomeyLogData['container'] = new Container();

        this.HomeyLogData['transports'] = [
            new transports.Console({
                handleExceptions: true,
                handleRejections: true,
                format: combine(
                    colorize(),
                    printf(({ level, message }) => {
                        return `[${level}] ${message}`;
                    })
                ),
                silent: !parseInt(this.HomeyLogData.config.console_enabled),
                level: this.HomeyLogData.config.console_level
            })
        ];

        if (this.HomeyLogData.logtail) {
            this.HomeyLogData['transports'].push(
                new LogtailTransport(this.HomeyLogData.logtail, {
                    handleExceptions: true,
                    handleRejections: true,
                    silent: !parseInt(this.HomeyLogData.config.publish_enabled),
                    level: this.HomeyLogData.config.publish_level
                })
            );
        }

        this.HomeyLogData['container'].add('HomeyLogInstance', {
            levels: logLevels.levels,
            transports: this.HomeyLogData['transports']
        });

        this.HomeyLogInstance = this.HomeyLogData['container'].get('HomeyLogInstance');
    }

    async trace() {
        this.HomeyLogInstance.log('trace', util.format(...arguments));
    }

    async debug() {
        this.HomeyLogInstance.log('debug', util.format(...arguments));
    }

    async info() {
        this.HomeyLogInstance.log('info', util.format(...arguments));
    }

    async log() {
        this.HomeyLogInstance.log('info', util.format(...arguments));
    }

    async warn() {
        this.HomeyLogInstance.log('warn', util.format(...arguments));
    }

    async error() {
        this.HomeyLogInstance.log('error', util.format(...arguments));
    }

    async fatal() {
        this.HomeyLogInstance.log('fatal', util.format(...arguments));
    }

    async addHomeyLogChild(scope) {
        if (!scope.length || !this.HomeyLogData.logtail) {
            return this.HomeyLogInstance;
        }

        this.HomeyLogData['container'].add(scope, {
            levels: logLevels.levels,
            transports: this.HomeyLogData['transports']
        });

        return this.HomeyLogData['container'].get(scope);
    }
}

module.exports = HomeyLog;
