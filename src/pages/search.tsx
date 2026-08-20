import type {ReactNode} from 'react';
import {useEffect} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import '@pagefind/default-ui/css/ui.css';

declare global { interface Window { PagefindUI?: new (options: Record<string, unknown>) => unknown; } }

export default function SearchPage(): ReactNode {
  const bundlePath = useBaseUrl('pagefind/');
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${bundlePath}pagefind-ui.js`;
    script.onload = () => {
      if (window.PagefindUI) new window.PagefindUI({element: '#documentation-search', bundlePath, showSubResults: true, showImages: false});
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, [bundlePath]);
  return <Layout title="搜索文档" description="检索智慧水务算法平台文档">
    <main className="container margin-vert--xl"><h1>搜索文档</h1><p>搜索索引随批准快照生成，支持中文关键字检索。</p><div id="documentation-search" /></main>
  </Layout>;
}
