import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Button from '../components/common/Button';
import { EnvelopeOpenIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function InvitationsPage() {
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingInvitation, setProcessingInvitation] = useState(null);

  useEffect(() => {
    if (currentUser?.role !== 'student') {
      setError('This page is only accessible to students');
      setIsLoading(false);
      return;
    }
    
    fetchInvitations();
  }, [currentUser]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/invitation/student', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });

      if (response.data.success) {
        setInvitations(response.data.data);
      } else {
        setError('Failed to load invitations');
      }
    } catch (err) {
      setError('An error occurred while loading your invitations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const respondToInvitation = async (invitationId, response) => {
    setProcessingInvitation(invitationId);
    try {
      const result = await axios.put(`/api/invitation/${invitationId}/respond`, 
        { response },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );

      if (result.data.success) {
        // Update the local state
        setInvitations(prevInvitations => 
          prevInvitations.filter(inv => inv._id !== invitationId)
        );
      }
    } catch (err) {
      setError(`Failed to ${response} invitation`);
      console.error(err);
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Loading spinner
  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex justify-center items-center p-4">
        <div className="bg-gray-800/50 p-8 rounded-2xl max-w-md text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center mb-8 pb-4 border-b border-gray-700">
          <EnvelopeOpenIcon className="h-8 w-8 text-indigo-400 mr-3" />
          <h1 className="text-3xl font-bold">Quiz Invitations</h1>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-gray-800/50 p-8 rounded-2xl text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-gray-300">You have no pending quiz invitations.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {invitations.map((invitation, index) => (
              <motion.div
                key={invitation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{invitation.quiz.title}</h3>
                    <p className="text-gray-400 text-sm">
                      From: {invitation.teacher.name} • Invited: {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        invitation.quiz.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                        invitation.quiz.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {invitation.quiz.difficulty}
                      </span>
                      <span className="ml-3 text-gray-400 text-sm">{invitation.quiz.level}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      onClick={() => respondToInvitation(invitation._id, 'accepted')}
                      disabled={processingInvitation === invitation._id}
                      isLoading={processingInvitation === invitation._id}
                      className="px-4 py-2"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => respondToInvitation(invitation._id, 'rejected')}
                      disabled={processingInvitation === invitation._id}
                      className="px-4 py-2"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvitationsPage; 