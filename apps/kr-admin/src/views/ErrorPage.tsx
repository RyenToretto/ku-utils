import { AccountAccessTip } from '@/views/AuthStatusShell';

export default function ErrorPage({ code }: { code?: string | number | null }) {
  return (
    <AccountAccessTip
      title="页面异常"
      description="资源加载失败或发生未知错误。可尝试重新登录，或联系管理员排查。"
      code={code}
    />
  );
}
