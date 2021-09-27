import { INTERNET } from '@jupiterone/data-model';
import {
  isHost,
  isInternet,
  isPublicIp,
  PrimitiveEntity,
  RelationshipDirection,
  TargetFilterKey,
} from '@jupiterone/integration-sdk-core';
import { compute_v1 } from 'googleapis';

export interface ComputeFirewallRule {
  IPProtocol?: string;
  ports?: string[];
}

export interface FirewallRulePortRange {
  /**
   * The original port range value.
   */
  portRange: string;
  fromPort?: number;
  toPort?: number;
}

export interface ProcessedFirewallRule {
  protocol: string;
  ports: FirewallRulePortRange[];
}

export function processFirewallRule(
  rule: ComputeFirewallRule,
): ProcessedFirewallRule {
  const protocol = rule.IPProtocol as string;

  if (!rule.ports) {
    return {
      protocol,
      ports: [
        {
          portRange: '*',
          fromPort: 0,
          toPort: 65535,
        },
      ],
    };
  }

  return {
    protocol,
    ports: rule.ports.map((portRange) => {
      const ports = portRange.split('-');
      const fromPort = parseInt(ports[0]);
      const toPort = parseInt(ports[1] !== undefined ? ports[1] : ports[0]);

      return {
        portRange: fromPort === 0 && toPort === 65535 ? '*' : portRange,
        fromPort,
        toPort,
      };
    }),
  };
}

export function isFirewallRuleEgress(firewall: compute_v1.Schema$Firewall) {
  return firewall.direction === 'EGRESS';
}

export function getFirewallIpRanges(firewall: compute_v1.Schema$Firewall) {
  const isEgress = isFirewallRuleEgress(firewall);

  return isEgress
    ? firewall.destinationRanges || []
    : firewall.sourceRanges || [];
}

export function getFirewallRelationshipDirection(
  firewall: compute_v1.Schema$Firewall,
): RelationshipDirection {
  return isFirewallRuleEgress(firewall)
    ? RelationshipDirection.FORWARD
    : RelationshipDirection.REVERSE;
}

export interface FirewallRuleRelationshipTargetProperties
  extends FirewallRulePortRange {
  ipRange: string;
  protocol: string;
  ipProtocol: string;
  ruleIndex: number;
  protocolIndex: number;
}

export interface FirewallRuleRelationshipTarget {
  targetFilterKeys: TargetFilterKey[];
  targetEntity: Partial<PrimitiveEntity>;
  properties: FirewallRuleRelationshipTargetProperties;
}

export async function processFirewallRuleRelationshipTargets({
  ruleIndex,
  rule,
  ipRanges,
  callback,
}: {
  ruleIndex: number;
  rule: ComputeFirewallRule;
  ipRanges: string[];
  callback: (r: FirewallRuleRelationshipTarget) => Promise<void>;
}) {
  const processedRule = processFirewallRule(rule);
  const protocol = processedRule.protocol.toLowerCase();

  for (const [
    protocolIndex,
    processedRulePortData,
  ] of processedRule.ports.entries()) {
    for (const ipRange of ipRanges) {
      const relationshipProperties: FirewallRuleRelationshipTargetProperties = {
        ...processedRulePortData,
        ipRange,
        protocol,
        ipProtocol: protocol,
        ruleIndex,
        protocolIndex,
      };

      if (isInternet(ipRange)) {
        await callback({
          targetFilterKeys: [['_type', '_key']],
          targetEntity: INTERNET,
          properties: relationshipProperties,
        });
      } else if (isHost(ipRange)) {
        const ipAddress = ipRange.split('/')[0];

        if (isPublicIp(ipRange)) {
          await callback({
            targetFilterKeys: [['_class', 'publicIpAddress']],
            targetEntity: {
              _class: 'Host',
              publicIpAddress: ipAddress,
            },
            properties: relationshipProperties,
          });
        } else {
          await callback({
            targetFilterKeys: [['_class', 'privateIpAddress']],
            targetEntity: {
              _class: 'Host',
              privateIpAddress: ipAddress,
            },
            properties: relationshipProperties,
          });
        }
      } else {
        await callback({
          targetFilterKeys: [['_class', 'CIDR']],
          targetEntity: {
            _class: 'Network',
            CIDR: ipRange,
            netmask: ipRange.split('/')[1],
          },
          properties: relationshipProperties,
        });
      }
    }
  }
}
