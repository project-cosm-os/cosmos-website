export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags: string[];
  readingTime: number;
  content: string;
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 230;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const frontmatter = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''));
    }

    data[key] = value;
  }

  return { data, content };
}

function parsePost(raw: string): BlogPost {
  const { data, content } = parseFrontmatter(raw);
  return {
    slug: data.slug as string,
    title: data.title as string,
    date: data.date as string,
    author: (data.author as string) ?? 'CosmOS Team',
    description: (data.description as string) ?? '',
    tags: (data.tags as string[]) ?? [],
    readingTime: estimateReadingTime(content),
    content,
  };
}

const postModules = import.meta.glob('/content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const posts: BlogPost[] = Object.values(postModules)
  .map((raw) => parsePost(raw as string))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
