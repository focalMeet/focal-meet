import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MeetingDetail from '../../components/MeetingDetail';

const MeetingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return (
    <MeetingDetail meetingId={id ?? ''} onBack={() => navigate(-1)} />
  );
};

export default MeetingDetailPage;


