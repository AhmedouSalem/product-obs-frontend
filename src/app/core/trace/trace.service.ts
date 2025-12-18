import { Injectable } from '@angular/core';
import { trace, context, Span, SpanStatusCode } from '@opentelemetry/api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TraceService {
    private tracer = trace.getTracer('product-obs-frontend');

    startSpan(name: string, attrs?: Record<string, any>): Span {
        const span = this.tracer.startSpan(name);
        if (attrs) {
            Object.entries(attrs).forEach(([k, v]) => span.setAttribute(k, v as any));
        }
        return span;
    }

    run<T>(name: string, fn: () => T, attrs?: Record<string, any>): T {
        const span = this.startSpan(name, attrs);
        try {
            const res = fn();
            span.setStatus({ code: SpanStatusCode.OK });
            return res;
        } catch (e: any) {
            span.recordException(e);
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw e;
        } finally {
            span.end();
        }
    }
    
    runObservable<T>(
        name: string,
        obsFactory: () => Observable<T>,
        attrs?: Record<string, any>
    ): Observable<T> {
        const span = this.startSpan(name, attrs);

        return new Observable<T>((subscriber) => {
            const sub = context.with(trace.setSpan(context.active(), span), () =>
                obsFactory().subscribe({
                    next: (v) => subscriber.next(v),
                    error: (err) => {
                        span.recordException(err);
                        span.setStatus({ code: SpanStatusCode.ERROR });
                        span.end();
                        subscriber.error(err);
                    },
                    complete: () => {
                        span.setStatus({ code: SpanStatusCode.OK });
                        span.end();
                        subscriber.complete();
                    }
                })
            );

            return () => sub.unsubscribe();
        });
    }

}
