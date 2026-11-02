"use client";
import { useState } from "react";
import { DemoFrame, DemoRange, useDemoContent } from "./demo-frame";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import type { DemoComponentProps } from "./types";
const address = [192, 168, 1, 101];
function bytes(mask: number) {
  return [24, 16, 8, 0].map((shift) => (mask >>> shift) & 255);
}
export default function Ipv4PrefixDemo(props: DemoComponentProps) {
  const { t } = useDemoContent(props);
  const [prefix, setPrefix] = useState(24);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const octets = bytes(mask);
  const network = address.map((value, i) => value & octets[i]!);
  return (
    <DemoFrame
      {...props}
      label={t("label")}
      intro={t.raw("intro") as string}
      controls={
        <DemoRange
          label={t.markdown("prefix")}
          value={prefix}
          display={`/${prefix}`}
          min={0}
          max={32}
          onChange={setPrefix}
        />
      }
      conclusion={
        <IcuMarkdownText
          value={t.markdown("result", {
            mask: octets.join("."),
            network: network.join("."),
          })}
        />
      }
    >
      <div className="overflow-x-auto px-6 py-4">
        <table className="demo-table">
          <tbody>
            <tr>
              <th scope="row">
                <IcuMarkdownText value={t.markdown("address")} />
              </th>
              {address.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value={t.markdown("mask")} />
              </th>
              {octets.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">
                <IcuMarkdownText value={t.markdown("network")} />
              </th>
              {network.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
}
