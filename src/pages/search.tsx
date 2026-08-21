import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import '@pagefind/default-ui/css/ui.css';

declare global {
  interface Window {
    PagefindUI?: new (options: Record<string, unknown>) => {
      triggerSearch: (term: string) => void;
    };
  }
}

export default function SearchPage(): ReactNode {
  const bundlePath = useBaseUrl('pagefind/');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${bundlePath}pagefind-ui.js`;
    script.async = true;
    script.onload = () => {
      if (window.PagefindUI) {
        try {
          new window.PagefindUI({
            element: '#documentation-search',
            bundlePath,
            showSubResults: true,
            showImages: false,
            autofocus: true,
            translations: {
              placeholder: '输入关键词检索时序治理、算法库、API 契约或运维手册...',
              clear_search: '清除',
              load_more: '加载更多结果',
              search_label: '站内检索',
              filters_label: '筛选分类',
              zero_results: '未找到包含 "[SEARCH_TERM]" 的相关文档',
              many_results: '找到 [COUNT] 条关于 "[SEARCH_TERM]" 的相关结果',
              one_result: '找到 1 条关于 "[SEARCH_TERM]" 的相关结果',
              alt_search: '未找到 "[SEARCH_TERM]" 的直接匹配。为您显示类似结果：',
              search_suggestion: '未找到 "[SEARCH_TERM]"。您是否想检索：',
              searching: '正在极速检索文档索引库...'
            }
          });
        } catch (e) {
          console.error('PagefindUI initialization failed:', e);
          setLoadError(true);
        }
      }
    };
    script.onerror = () => {
      setLoadError(true);
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [bundlePath]);

  return (
    <Layout title="全文搜索" description="检索智慧水务算法平台全量技术文档与 API 规范">
      <main className="container margin-vert--lg" style={{maxWidth: '920px', minHeight: '65vh'}}>
        <div style={{marginBottom: '1.75rem'}}>
          <h1 style={{fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em'}}>
            🔍 文档检索
          </h1>
        </div>

        {loadError && (
          <div className="alert alert--warning" style={{marginBottom: '1.5rem'}}>
            <strong>💡 提示</strong>：未检测到已生成的 Pagefind 搜索索引。若在本地开发环境中，请先运行 <code>npm run build</code> 生成全量索引，或使用生产服务。
          </div>
        )}

        <div id="documentation-search" style={{minHeight: '200px'}} />
      </main>
    </Layout>
  );
}
