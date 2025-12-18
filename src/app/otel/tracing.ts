import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';

import { resourceFromAttributes } from '@opentelemetry/resources';

export function initTracing() {
  // debug OpenTelemetry
  // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const exporter = new OTLPTraceExporter({
    url: 'http://localhost:14318/v1/traces',
  });

  const resource = resourceFromAttributes({
    'service.name': 'product-obs-frontend',
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation(),

      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/^http:\/\/localhost:8080\/.*/],
      }),

      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [/^http:\/\/localhost:8080\/.*/],
      }),
    ],
  });
}
