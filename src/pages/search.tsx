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

const hotTags = [
  'Chronos-2',
  'DMA漏损',
  '时序数据治理',
  '工作流编排',
  'JWT认证',
  'Celery队列',
  '只读MySQL',
  'Hampel异常检测',
  '算子参数'
];

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

  const handleTagClick = (tag: string) => {
    const inputEl = document.querySelector('#documentation-search input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.value = tag;
      inputEl.dispatchEvent(new Event('input', {bubbles: true}));
      inputEl.focus();
    }
  };

  return (
    <Layout title="全文搜索" description="检索智慧水务算法平台全量技术文档与 API 规范">
      <main className="container margin-vert--lg" style={{maxWidth: '920px', minHeight: '65vh'}}>
        <div style={{marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em'}}>
            🔍 文档全库检索
          </h1>
          <p style={{color: '#94a3b8', fontSize: '0.95rem', margin: 0}}>
            基于毫秒级全文静态索引，覆盖平台架构、快速入门、算法模型库、API 契约及运维测试全量 96 篇文档。
          </p>
        </div>

        <div style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'}}>
          <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 600}}>热门检索：</span>
          {hotTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              type="button"
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                color: '#38bdf8',
                borderRadius: '16px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)';
                e.currentTarget.style.borderColor = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.22)';
              }}
            >
              {tag}
            </button>
          ))}
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
