import type { ReactNode } from "react";
import type { PortableTextBlock, PortableTextSpan } from "@/sanity/lib/catalogTypes";

type SimplePortableTextProps = {
  value: PortableTextBlock[];
};

function renderSpan(span: PortableTextSpan, markDefs: PortableTextBlock["markDefs"]) {
  let content: ReactNode = span.text || "";
  const marks = span.marks || [];

  for (const mark of marks) {
    if (mark === "strong") content = <strong>{content}</strong>;
    else if (mark === "em") content = <em>{content}</em>;
    else {
      const definition = markDefs?.find((item) => item._key === mark);
      if (definition?._type === "link" && definition.href) {
        const external = definition.href.startsWith("http://") || definition.href.startsWith("https://");
        content = (
          <a href={definition.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {content}
          </a>
        );
      }
    }
  }

  return <span key={span._key || `${span.text}-${marks.join("-")}`}>{content}</span>;
}

export function SimplePortableText({ value }: SimplePortableTextProps) {
  if (!value.length) return null;

  return (
    <div className="portable-copy">
      {value.map((block, index) => {
        if (block._type !== "block") return null;
        const children = (block.children || []).map((span) => renderSpan(span, block.markDefs));
        const key = block._key || `block-${index}`;

        if (block.style === "h2") return <h2 key={key}>{children}</h2>;
        if (block.style === "h3") return <h3 key={key}>{children}</h3>;
        if (block.style === "blockquote") return <blockquote key={key}>{children}</blockquote>;
        if (block.listItem === "bullet") return <p key={key} className="portable-list-item">• {children}</p>;
        if (block.listItem === "number") return <p key={key} className="portable-list-item">{block.level || 1}. {children}</p>;
        return <p key={key}>{children}</p>;
      })}
    </div>
  );
}
