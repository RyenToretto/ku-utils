import { CheckCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { buildLoginUrl } from '@/utils/authRedirect';
import AuthStatusShell from '@/views/AuthStatusShell';

export default function LoggedOut() {
  return (
    <AuthStatusShell
      titleId="logged-out-title"
      iconTone="success"
      role="status"
      icon={<CheckCircleOutlined style={{ fontSize: 32 }} />}
      title="已退出登录"
      desc="会话已安全退出。重新登录后将回到工作台。"
      actions={
        <Button
          type="primary"
          onClick={() => {
            window.location.href = buildLoginUrl('/');
          }}
        >
          重新登录
        </Button>
      }
    />
  );
}
