import assert from 'assert';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import request from 'request';
import sinon from 'sinon';
import { debugLog, getAccessToken } from './lineworks_jwt.mjs';

describe('lineworks_jwt', function () {
    describe('#debugLog()', function () {
        it('should log message when DEBUG_MODE is True', function () {
            const consoleLog = sinon.stub(console, 'log');
            process.env.DEBUG_MODE = "True";
            debugLog("test message");
            assert(consoleLog.calledWith("test message"));
            consoleLog.restore();
        });

        it('should not log message when DEBUG_MODE is not True', function () {
            const consoleLog = sinon.stub(console, 'log');
            process.env.DEBUG_MODE = "False";
            debugLog("test message");
            assert(consoleLog.notCalled);
            consoleLog.restore();
        });
    });

    describe('#getAccessToken()', function () {
        beforeEach(function () {
            sinon.stub(jwt, 'sign').returns('test_jwt');
            sinon.stub(fs, 'readFileSync').returns('test_private_key');
            sinon.stub(request, 'post').yields(null, {}, JSON.stringify({ access_token: 'test_access_token' }));
        });

        afterEach(function () {
            jwt.sign.restore();
            fs.readFileSync.restore();
            request.post.restore();
        });

        it('should return access token', async function () {
            const token = await getAccessToken();
            assert.equal(token, 'test_access_token');
        });

        it('should throw error when request.post encounters an error', async function () {
            request.post.yields(new Error('test error'), {}, '');
            try {
                await getAccessToken();
                assert.fail('Expected error was not thrown');
            } catch (error) {
                assert.equal(error.message, 'test error');
            }
        });
    });
});
