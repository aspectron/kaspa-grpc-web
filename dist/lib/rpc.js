import { FlowGRPCWeb } from '@aspectron/flow-grpc-web';
export class RPC {
    constructor(options = {}) {
        this.isReady = false;
        this.queue = [];
        this.verbose = false;
        this.pending = {};
        this.client = new FlowGRPCWeb(options.grpc || {});
        this.client.on("ready", (clients) => {
            console.log("gRPCWeb::::clients", clients);
            let { RPC } = clients;
            const stream = RPC.MessageStream();
            this.stream = stream;
            console.log("stream", stream);
            stream.on("end", () => {
                console.log("stream end");
            });
            this.initIntake(stream);
            this.isReady = true;
            this.processQueue();
        });
    }
    initIntake(stream) {
        stream.on('data', (data) => {
            if (data.payload) {
                let name = data.payload;
                let payload = data[name];
                let ident = name.replace(/^get|Response$/ig, '').toLowerCase();
                this.handleIntake({ name, payload, ident });
            }
        });
    }
    handleIntake(o) {
        if (this.intakeHandler) {
            this.intakeHandler(o);
        }
        else {
            let handlers = this.pending[o.name];
            this.verbose && console.log('intake:', o, 'handlers:', handlers);
            if (handlers && handlers.length) {
                let pendingItem = handlers.shift();
                if (pendingItem)
                    pendingItem.resolve(o.payload);
            }
        }
    }
    setIntakeHandler(fn) {
        this.intakeHandler = fn;
    }
    processQueue() {
        if (!this.isReady)
            return;
        let item = this.queue.shift();
        while (item) {
            const resp = item.method.replace(/Request$/, 'Response');
            if (!this.pending[resp])
                this.pending[resp] = [];
            let handlers = this.pending[resp];
            handlers.push(item);
            let req = {};
            req[item.method] = item.data;
            this.stream.write(req);
            item = this.queue.shift();
        }
    }
    clearPending() {
        Object.keys(this.pending).forEach(key => {
            let list = this.pending[key];
            list.forEach(o => o.reject('closing by force'));
            this.pending[key] = [];
        });
    }
    request(method, data, resolve, reject) {
        this.queue.push({ method, data, resolve, reject });
        this.processQueue();
    }
    getBlock(hash) {
        return new Promise((resolve, reject) => {
            this.request('getBlockRequest', { hash, includeBlockVerboseData: true }, resolve, reject);
        });
    }
    getAddressTransactions(address, limit, skip) {
        return new Promise((resolve, reject) => {
            this.request('getAddressTransactions', { address, limit, skip }, resolve, reject);
        });
    }
    getUtxos(address, limit, skip) {
        return new Promise((resolve, reject) => {
            this.request('getUTXOsByAddressRequest', { address, limit, skip }, resolve, reject);
        });
    }
    postTx(tx) {
        return new Promise((resolve, reject) => {
            this.request('submitTransactionRequest', tx, resolve, reject);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3JwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFtQnJELE1BQU0sT0FBTyxHQUFHO0lBU2YsWUFBWSxVQUFZLEVBQUU7UUFSMUIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUd4QixVQUFLLEdBQWUsRUFBRSxDQUFDO1FBR3ZCLFlBQU8sR0FBVyxLQUFLLENBQUM7UUFHdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQVcsRUFBQyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDMUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxHQUFHLE9BQU8sQ0FBQztZQUVwQixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDN0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRSxFQUFFO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENB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MEI7UUFDaEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Zsb3dHUlBDV2VifSBmcm9tICdAYXNwZWN0cm9uL2Zsb3ctZ3JwYy13ZWInO1xuLy9jb25zdCBGbG93R1JQQ1dlYiA9IG5ldyBGbG93R1JQQ1dlYigpO1xuaW1wb3J0IHtJUlBDLCBBcGl9IGZyb20gJy4uL3R5cGVzL2N1c3RvbS10eXBlcyc7XG5pbnRlcmZhY2UgUXVldWVJdGVte1xuXHRtZXRob2Q6c3RyaW5nLFxuXHRkYXRhOmFueSxcblx0cmVzb2x2ZTpGdW5jdGlvbixcblx0cmVqZWN0OkZ1bmN0aW9uXG59XG5pbnRlcmZhY2UgUGVuZGluZ1JlcXMge1xuXHRbaW5kZXg6c3RyaW5nXTpRdWV1ZUl0ZW1bXTtcbn1cbmludGVyZmFjZSBJRGF0YXtcblx0bmFtZTpzdHJpbmcsXG5cdHBheWxvYWQ6YW55LFxuXHRpZGVudDpzdHJpbmdcbn1cbmRlY2xhcmUgdHlwZSBJU3RyZWFtID0gYW55O1xuXG5leHBvcnQgY2xhc3MgUlBDIGltcGxlbWVudHMgSVJQQ3tcblx0aXNSZWFkeTpib29sZWFuID0gZmFsc2U7XG5cdGNsaWVudDpGbG93R1JQQ1dlYjtcblx0c3RyZWFtOklTdHJlYW07XG5cdHF1ZXVlOlF1ZXVlSXRlbVtdID0gW107XG5cdHBlbmRpbmc6UGVuZGluZ1JlcXM7XG5cdGludGFrZUhhbmRsZXI6RnVuY3Rpb258dW5kZWZpbmVkO1xuXHR2ZXJib3NlOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOmFueT17fSl7XG5cdFx0dGhpcy5wZW5kaW5nID0ge307XG5cdFx0dGhpcy5jbGllbnQgPSBuZXcgRmxvd0dSUENXZWIob3B0aW9ucy5ncnBjfHx7fSk7XG5cblx0XHR0aGlzLmNsaWVudC5vbihcInJlYWR5XCIsIChjbGllbnRzOmFueSk9Pntcblx0XHRcdGNvbnNvbGUubG9nKFwiZ1JQQ1dlYjo6OjpjbGllbnRzXCIsIGNsaWVudHMpXG5cdFx0XHRsZXQge1JQQ30gPSBjbGllbnRzO1xuXG5cdFx0XHRjb25zdCBzdHJlYW0gPSBSUEMuTWVzc2FnZVN0cmVhbSgpO1xuXHRcdFx0dGhpcy5zdHJlYW0gPSBzdHJlYW07XG5cdFx0XHRjb25zb2xlLmxvZyhcInN0cmVhbVwiLCBzdHJlYW0pXG5cdFx0XHRzdHJlYW0ub24oXCJlbmRcIiwgKCk9Pntcblx0XHRcdFx0Y29uc29sZS5sb2coXCJzdHJlYW0gZW5kXCIpXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuaW5pdEludGFrZShzdHJlYW0pO1xuXHRcdFx0dGhpcy5pc1JlYWR5ID0gdHJ1ZTtcblx0XHRcdHRoaXMucHJvY2Vzc1F1ZXVlKCk7XG5cdFx0fSlcblx0fVxuXHRpbml0SW50YWtlKHN0cmVhbTpJU3RyZWFtKSB7XG4gICAgICAgIHN0cmVhbS5vbignZGF0YScsKGRhdGE6YW55KSA9PiB7XG4gICAgICAgICAgICBpZihkYXRhLnBheWxvYWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGRhdGEucGF5bG9hZDtcbiAgICAgICAgICAgICAgICBsZXQgcGF5bG9hZCA9IGRhdGFbbmFtZV07XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50ID0gbmFtZS5yZXBsYWNlKC9eZ2V0fFJlc3BvbnNlJC9pZywnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUludGFrZSh7bmFtZSwgcGF5bG9hZCwgaWRlbnR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmRsZUludGFrZShvOklEYXRhKSB7XG4gICAgICAgIGlmKHRoaXMuaW50YWtlSGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5pbnRha2VIYW5kbGVyKG8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXJzID0gdGhpcy5wZW5kaW5nW28ubmFtZV07XG4gICAgICAgICAgICB0aGlzLnZlcmJvc2UgJiYgY29uc29sZS5sb2coJ2ludGFrZTonLG8sJ2hhbmRsZXJzOicsaGFuZGxlcnMpO1xuICAgICAgICAgICAgaWYoaGFuZGxlcnMgJiYgaGFuZGxlcnMubGVuZ3RoKXtcbiAgICAgICAgICAgIFx0bGV0IHBlbmRpbmdJdGVtOlF1ZXVlSXRlbXx1bmRlZmluZWQgPSBoYW5kbGVycy5zaGlmdCgpO1xuICAgICAgICAgICAgXHRpZihwZW5kaW5nSXRlbSlcbiAgICAgICAgICAgICAgICBcdHBlbmRpbmdJdGVtLnJlc29sdmUoby5wYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEludGFrZUhhbmRsZXIoZm46RnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5pbnRha2VIYW5kbGVyID0gZm47XG4gICAgfVxuXHRwcm9jZXNzUXVldWUoKXtcblx0XHRpZighdGhpcy5pc1JlYWR5KVxuXHRcdFx0cmV0dXJuXG5cblx0XHRsZXQgaXRlbTpRdWV1ZUl0ZW18dW5kZWZpbmVkID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuXHRcdHdoaWxlKGl0ZW0pe1xuXHRcdFx0Y29uc3QgcmVzcCA9IGl0ZW0ubWV0aG9kLnJlcGxhY2UoL1JlcXVlc3QkLywnUmVzcG9uc2UnKTtcbiAgICAgICAgICAgIGlmKCF0aGlzLnBlbmRpbmdbcmVzcF0pXG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nW3Jlc3BdID0gW107XG4gICAgICAgICAgICBsZXQgaGFuZGxlcnM6UXVldWVJdGVtW10gPSB0aGlzLnBlbmRpbmdbcmVzcF07XG4gICAgICAgICAgICBoYW5kbGVycy5wdXNoKGl0ZW0pO1xuXG5cdFx0XHRsZXQgcmVxOmFueSA9IHt9O1xuXHRcdFx0cmVxW2l0ZW0ubWV0aG9kXSA9IGl0ZW0uZGF0YTtcblx0XHRcdHRoaXMuc3RyZWFtLndyaXRlKHJlcSk7XG5cblx0XHRcdGl0ZW0gPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cdFx0fVxuXHR9XG5cdGNsZWFyUGVuZGluZygpIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5wZW5kaW5nKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICBsZXQgbGlzdCA9IHRoaXMucGVuZGluZ1trZXldO1xuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKG89Pm8ucmVqZWN0KCdjbG9zaW5nIGJ5IGZvcmNlJykpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nW2tleV0gPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuXHRyZXF1ZXN0KG1ldGhvZDpzdHJpbmcsIGRhdGE6YW55LCByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb24pe1xuXHRcdHRoaXMucXVldWUucHVzaCh7bWV0aG9kLCBkYXRhLCByZXNvbHZlLCByZWplY3R9KTtcblx0XHR0aGlzLnByb2Nlc3NRdWV1ZSgpO1xuXHR9XG5cdGdldEJsb2NrKGhhc2g6c3RyaW5nKTogUHJvbWlzZTxBcGkuQmxvY2tSZXNwb25zZT57XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG5cdFx0XHR0aGlzLnJlcXVlc3QoJ2dldEJsb2NrUmVxdWVzdCcsIHtoYXNoLCBpbmNsdWRlQmxvY2tWZXJib3NlRGF0YTp0cnVlfSwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KVxuXHR9XG5cdGdldEFkZHJlc3NUcmFuc2FjdGlvbnMoYWRkcmVzczpzdHJpbmcsIGxpbWl0Om51bWJlciwgc2tpcDpudW1iZXIpOiBQcm9taXNlPEFwaS5UcmFuc2FjdGlvbltdPntcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9Pntcblx0XHRcdHRoaXMucmVxdWVzdCgnZ2V0QWRkcmVzc1RyYW5zYWN0aW9ucycsIHthZGRyZXNzLCBsaW1pdCwgc2tpcH0sIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSlcblx0fVxuXHRnZXRVdHhvcyhhZGRyZXNzOnN0cmluZywgbGltaXQ6bnVtYmVyLCBza2lwOm51bWJlcik6IFByb21pc2U8QXBpLlV0eG9bXT57XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG5cdFx0XHR0aGlzLnJlcXVlc3QoJ2dldFVUWE9zQnlBZGRyZXNzUmVxdWVzdCcsIHthZGRyZXNzLCBsaW1pdCwgc2tpcH0sIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSlcblx0fVxuXHRwb3N0VHgodHg6IEFwaS5UcmFuc2FjdGlvblJlcXVlc3QpOiBQcm9taXNlPEFwaS5UcmFuc2FjdGlvblJlc3BvbnNlPntcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9Pntcblx0XHRcdHRoaXMucmVxdWVzdCgnc3VibWl0VHJhbnNhY3Rpb25SZXF1ZXN0JywgdHgsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSlcblx0fVxufSJdfQ==