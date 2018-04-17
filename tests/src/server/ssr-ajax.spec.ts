/* tslint:disable:component-selector */

import { Component, PLATFORM_ID } from '@angular/core';

import { isPlatformServer } from '@angular/common';

import { DxServerTransferStateModule, NgHttp } from '../../../dist';

import * as def from 'devextreme/core/utils/deferred';
import * as ajax from 'devextreme/core/utils/ajax';

import { ServerModule } from '@angular/platform-server';
import { BrowserModule, TransferState, makeStateKey } from '@angular/platform-browser';

import {
    TestBed,
    async
} from '@angular/core/testing';

let mockSendRequest = {
    callBase: function() {
        let d = new def.Deferred();
        d.resolve('test', 'success');

        return d.promise();
    }
};

@Component({
    selector: 'test-container-component',
    template: ''
})
class TestContainerComponent {
}

describe('Universal', () => {
    let sendRequest: any;
    let ajaxInject = ajax.inject;
    beforeEach(() => {
        ajax.inject = function(obj) {
            sendRequest = obj['sendRequest'];

        };
        TestBed.configureTestingModule(
            {
                declarations: [TestContainerComponent],
                imports: [ServerModule,
                    DxServerTransferStateModule,
                    BrowserModule.withServerTransition({appId: 'appid'})],
                    providers: [NgHttp]
            });
    });

    afterEach(function() {
        ajax.inject = ajaxInject;
    });
    // spec
    it('should set state and remove data from the state when the request is repeated', async(() => {
        const platformId = TestBed.get(PLATFORM_ID);
        if (isPlatformServer(platformId)) {
            TestBed.get(NgHttp);

            sendRequest.apply(mockSendRequest, [{url: 'someurl'}]);
            const transferState: TransferState = TestBed.get(TransferState);
            let key = makeStateKey('0urlsomeurl');

            expect(transferState.hasKey(key)).toBe(true);
            expect(transferState.get(key, null as any)).toEqual(Object({ data: 'test', status: 'success' }));
        }
    }));

    it('should generate complex key', async(() => {
        const platformId = TestBed.get(PLATFORM_ID);
        if (isPlatformServer(platformId)) {
            TestBed.get(NgHttp);

            sendRequest.apply(mockSendRequest, [{url: 'someurl', data: { filter: { name: 'test'}, select: ['name']}}]);
            let key = makeStateKey('0urlsomeurldatafilternametestselect0name');
            const transferState: TransferState = TestBed.get(TransferState);

            expect(transferState.hasKey(key)).toBe(true);
        }
    }));

});
