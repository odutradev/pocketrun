import type { Application, CreateAppPayload, CreateAppResponse } from '@projectTypes/application'

export type UpdateAppPayload = Partial<CreateAppPayload>

export type { Application, CreateAppPayload, CreateAppResponse }
