'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function handleEvent(contextsInfo) {
    contextsInfo.forEach((handlersInfo, context) => {
        handlersInfo.forEach(handlerInfo => {
            wasSuccessApply(context, handlerInfo);
        });
    });
}

function wasSuccessApply(context, handlerInfo) {
    const { handler, times, frequency, tryToApplyCount } = handlerInfo;
    const shouldCall = (times === 0 || tryToApplyCount < times) &&
        (frequency === 0 || tryToApplyCount % frequency === 0);

    if (shouldCall) {
        handler.apply(context);
    }

    handlerInfo.tryToApplyCount += 1;

    return shouldCall;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const eventsInfo = new Map();

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} additionalInfo
         * @returns {Object}
         */
        on: function (event, context, handler, additionalInfo = { times: 0, frequency: 0 }) {
            const contextsInfo = eventsInfo.has(event) ? eventsInfo.get(event) : new Map();
            eventsInfo.set(event, contextsInfo);

            const handlersInfo = contextsInfo.has(context) ? contextsInfo.get(context) : [];
            contextsInfo.set(context, handlersInfo);

            handlersInfo.push({
                handler,
                times: additionalInfo.times,
                frequency: additionalInfo.frequency,
                tryToApplyCount: 0 });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            eventsInfo.forEach((eventInfo, eventName) => {
                if (event === eventName) {
                    eventsInfo.get(eventName).delete(context);
                }
            });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            const events = [];
            let path = '';
            const splitedEvent = event.split('.');

            splitedEvent.forEach((part, index) => {
                path += part;
                events.push(path);
                path += index === splitedEvent.length - 1 ? '' : '.';
            });

            events.reverse().forEach(eventName => {
                if (eventsInfo.has(eventName)) {
                    handleEvent(eventsInfo.get(eventName));
                }
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            this.on(event, context, handler, { times, frequency: 0 });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, handler, { times: 0, frequency });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
