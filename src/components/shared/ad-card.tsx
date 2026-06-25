import { ExternalLink } from "lucide-react";

interface AdCardProps {
  title: string;
  description?: string | null;
  image?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
}

function AdCardInner({ title, description, image, linkUrl, linkText }: AdCardProps) {
  return (
    <>
      <span className="absolute top-2.5 left-2.5 z-10 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
        Ad
      </span>

      {image && (
        <div className="h-44 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
        {linkUrl && (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {linkText || "Learn More"}
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </>
  );
}

const cardClass =
  "group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/15 hover:shadow-lg transition-all duration-300 hover:-translate-y-1";

export function AdCard(props: AdCardProps) {
  if (props.linkUrl) {
    return (
      <a href={props.linkUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <AdCardInner {...props} />
      </a>
    );
  }
  return (
    <div className={cardClass}>
      <AdCardInner {...props} />
    </div>
  );
}
