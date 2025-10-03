import { useNavigate } from 'react-router-dom';
import { GroupSettings } from '@/components/GroupSettings';
import { useAuth } from '@/hooks/use-auth';

export default function Settings() {
  const navigate = useNavigate();
  const { gitlabService } = useAuth();

  const handleBack = () => {
    navigate('/projects');
  };

  if (!gitlabService) {
    return null;
  }

  return (
    <GroupSettings
      gitlabService={gitlabService}
      onBack={handleBack}
    />
  );
}
