import { INTERNET } from '@jupiterone/data-model';
import { getMockComputeFirewall } from '../../test/mocks';
import {
  ComputeFirewallRule,
  getFirewallIpRanges,
  getFirewallRelationshipDirection,
  ProcessedFirewallRule,
  processFirewallRule,
  processFirewallRuleRelationshipTargets,
} from './firewall';

describe('#processFirewallRule', () => {
  test('should return * range if "ports" property is not specified', () => {
    const rule: ComputeFirewallRule = {
      IPProtocol: 'tcp',
    };

    const expected: ProcessedFirewallRule = {
      protocol: 'tcp',
      ports: [
        {
          portRange: '*',
          fromPort: 0,
          toPort: 65535,
        },
      ],
    };

    expect(processFirewallRule(rule)).toEqual(expected);
  });

  test('should return range where fromPort and toPort are the same if no dashes in supplied port range', () => {
    const rule: ComputeFirewallRule = {
      IPProtocol: 'tcp',
      ports: ['443'],
    };

    const expected: ProcessedFirewallRule = {
      protocol: 'tcp',
      ports: [
        {
          portRange: '443',
          fromPort: 443,
          toPort: 443,
        },
      ],
    };

    expect(processFirewallRule(rule)).toEqual(expected);
  });

  test('should return range where fromPort and toPort are numerical range of dash split port range', () => {
    const rule: ComputeFirewallRule = {
      IPProtocol: 'tcp',
      ports: ['123-456'],
    };

    const expected: ProcessedFirewallRule = {
      protocol: 'tcp',
      ports: [
        {
          portRange: '123-456',
          fromPort: 123,
          toPort: 456,
        },
      ],
    };

    expect(processFirewallRule(rule)).toEqual(expected);
  });

  test('should convert to star portRange if supplied range is 0-65535', () => {
    const rule: ComputeFirewallRule = {
      IPProtocol: 'tcp',
      ports: ['0-65535'],
    };

    const expected: ProcessedFirewallRule = {
      protocol: 'tcp',
      ports: [
        {
          portRange: '*',
          fromPort: 0,
          toPort: 65535,
        },
      ],
    };

    expect(processFirewallRule(rule)).toEqual(expected);
  });
});

describe('#getFirewallIpRanges', () => {
  test('should return destinationRanges if firewall has EGRESS direction', () => {
    expect(
      getFirewallIpRanges(
        getMockComputeFirewall({
          direction: 'EGRESS',
          destinationRanges: ['1.2.3.4/0'],
          sourceRanges: undefined,
        }),
      ),
    ).toEqual(['1.2.3.4/0']);
  });

  test('should return sourceRanges if firewall has INGRESS direction', () => {
    expect(
      getFirewallIpRanges(
        getMockComputeFirewall({
          direction: 'INGRESS',
          sourceRanges: ['1.2.3.4/0'],
          destinationRanges: undefined,
        }),
      ),
    ).toEqual(['1.2.3.4/0']);
  });

  test('should return empty array if firewall has EGRESS direction and destinationRanges is undefined', () => {
    expect(
      getFirewallIpRanges(
        getMockComputeFirewall({
          direction: 'EGRESS',
          destinationRanges: undefined,
          sourceRanges: undefined,
        }),
      ),
    ).toEqual([]);
  });

  test('should return empty array if firewall has INGRESS direction and sourceRanges is undefined', () => {
    expect(
      getFirewallIpRanges(
        getMockComputeFirewall({
          direction: 'INGRESS',
          destinationRanges: undefined,
          sourceRanges: undefined,
        }),
      ),
    ).toEqual([]);
  });
});

describe('#getFirewallRelationshipDirection', () => {
  test('should return forward direction when firewall direction is EGRESS', () => {
    expect(
      getFirewallRelationshipDirection(
        getMockComputeFirewall({
          direction: 'EGRESS',
        }),
      ),
    ).toEqual('FORWARD');
  });

  test('should return reverse direction when firewall direction is INGRESS', () => {
    expect(
      getFirewallRelationshipDirection(
        getMockComputeFirewall({
          direction: 'INGRESS',
        }),
      ),
    ).toEqual('REVERSE');
  });
});

describe('#processFirewallRuleRelationshipTargets', () => {
  test('should process internet firewall rule', async () => {
    const cb = jest.fn().mockResolvedValue(Promise.resolve());

    const rule: ComputeFirewallRule = {
      IPProtocol: 'tcp',
      ports: ['123-456', '789-1011'],
    };

    await processFirewallRuleRelationshipTargets({
      ruleIndex: 0,
      rule,
      ipRanges: ['0.0.0.0/0'],
      callback: cb,
    });

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenNthCalledWith(1, {
      targetFilterKeys: [['_type', '_key']],
      targetEntity: INTERNET,
      properties: {
        fromPort: 123,
        toPort: 456,
        portRange: '123-456',
        ipRange: '0.0.0.0/0',
        protocol: 'tcp',
        ipProtocol: 'tcp',
        ruleIndex: 0,
        protocolIndex: 0,
      },
    });

    expect(cb).toHaveBeenNthCalledWith(2, {
      targetFilterKeys: [['_type', '_key']],
      targetEntity: INTERNET,
      properties: {
        fromPort: 789,
        toPort: 1011,
        portRange: '789-1011',
        ipRange: '0.0.0.0/0',
        protocol: 'tcp',
        ipProtocol: 'tcp',
        ruleIndex: 0,
        protocolIndex: 1,
      },
    });
  });
});
