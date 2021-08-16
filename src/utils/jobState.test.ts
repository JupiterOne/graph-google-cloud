import { JobState } from '@jupiterone/integration-sdk-core';
import {
  AccessData,
  cacheIfResourceIsPublic,
  getIfResourceIsPublic,
} from './jobState';

class MockJobState {
  data = {};
  setData = (key: string, data: any) => (this.data[key] = data);
  getData = (key: string) => this.data[key];
}

describe('cacheIfResourceIsPublic && getIfResourceIsPublic', () => {
  it('should get an access level that is stored in the jobState', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const data: AccessData = {
      accessLevel: 'private',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...data,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(data);
  });

  it('should update an publicRead access level with publicWrite', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const publicWriteAC: AccessData = {
      accessLevel: 'publicWrite',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicWriteAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicWriteAC);
  });

  it('should update an private access level with publicWrite', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const privateAC: AccessData = {
      accessLevel: 'private',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...privateAC,
    });
    const publicWriteAC: AccessData = {
      accessLevel: 'publicWrite',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicWriteAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicWriteAC);
  });

  it('should update an private access level with publicWrite', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const publicWriteAC: AccessData = {
      accessLevel: 'publicWrite',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicWriteAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicWriteAC);
  });

  it('should not update a publicWrite access level with publicRead', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicWriteAC: AccessData = {
      accessLevel: 'publicWrite',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicWriteAC,
    });
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicWriteAC);
  });

  it('should not update a publicWrite access level with private', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicWriteAC: AccessData = {
      accessLevel: 'publicWrite',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicWriteAC,
    });
    const privateAC: AccessData = {
      accessLevel: 'private',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...privateAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicWriteAC);
  });

  it('should not update a publicRead access level with private', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const privateAC: AccessData = {
      accessLevel: 'private',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...privateAC,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(publicReadAC);
  });

  it('should update a the condition to `undefined` when the access levels are the same and the new AC has no condition', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const noCondition: AccessData = {
      accessLevel: 'publicRead',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...noCondition,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response).toEqual(noCondition);
  });

  it('should update a the condition to both conditions when the access levels are the same and both have a condition', async () => {
    const jobState = new MockJobState() as unknown as JobState;
    const key = 'key';
    const type = 'type';
    const publicReadAC: AccessData = {
      accessLevel: 'publicRead',
      condition: 'some people can I guess.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC,
    });
    const publicReadAC2: AccessData = {
      accessLevel: 'publicRead',
      condition: 'sure, some other people too.',
    };
    await cacheIfResourceIsPublic(jobState, {
      type,
      key,
      ...publicReadAC2,
    });
    const response = await getIfResourceIsPublic(jobState, type, key);
    expect(response?.accessLevel).toEqual('publicRead');
    expect(response?.condition).toEqual(
      publicReadAC.condition + ' OR ' + publicReadAC2.condition,
    );
  });
});
