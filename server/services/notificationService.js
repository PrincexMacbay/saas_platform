const { sendNotification } = require('../socket/socketServer');
const { User, Post, Comment, Application, Plan, JobApplication, Job } = require('../models');

class NotificationService {
  // Application notifications
  async notifyApplicationSubmitted(applicationId) {
    try {
      console.log('🔍 notifyApplicationSubmitted: Starting', { applicationId });
      
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application) {
        console.log('⚠️ notifyApplicationSubmitted: Application not found', { applicationId });
        return;
      }

      if (!application.plan) {
        console.log('⚠️ notifyApplicationSubmitted: Plan not found for application', { 
          applicationId, 
          planId: application.planId 
        });
        return;
      }

      const planCreatorId = application.plan.createdBy;
      if (!planCreatorId) {
        console.log('⚠️ notifyApplicationSubmitted: Plan has no creator', { 
          planId: application.planId,
          planName: application.plan.name 
        });
        return;
      }

      console.log('📬 Sending application submitted notification:', {
        toUserId: planCreatorId,
        applicationId,
        planId: application.planId,
        planName: application.plan.name,
        applicantEmail: application.email
      });

      // Notify plan creator
      await sendNotification(
        planCreatorId,
        'application_submitted',
        'New Membership Application',
        `A new application has been submitted for ${application.plan.name}`,
        `/membership/applications?applicationId=${applicationId}`,
        { applicationId, planId: application.planId }
      );
      
      console.log('✅ notifyApplicationSubmitted: Notification sent successfully');
    } catch (error) {
      console.error('❌ Error notifying application submitted:', error);
      console.error('Error stack:', error.stack);
    }
  }

  async notifyApplicationApproved(applicationId) {
    try {
      console.log('🔍 notifyApplicationApproved: Starting', { applicationId });
      
      // Reload application to get latest data (userId should be set by now)
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application) {
        console.log('⚠️ notifyApplicationApproved: Application not found', { applicationId });
        return;
      }

      if (!application.plan) {
        console.log('⚠️ notifyApplicationApproved: Plan not found for application', { 
          applicationId, 
          planId: application.planId 
        });
        return;
      }

      // Application should have userId after approval
      let targetUserId = application.userId;
      
      if (!targetUserId) {
        console.log('⚠️ notifyApplicationApproved: Application has no userId, trying to find by email', { 
          applicationId, 
          email: application.email 
        });
        // Try to find user by email
        const { User } = require('../models');
        const user = await User.findOne({ where: { email: application.email } });
        if (!user) {
          console.log('❌ notifyApplicationApproved: User not found by email, cannot send notification', { 
            email: application.email 
          });
          return;
        }
        // Update application with userId for future reference
        await application.update({ userId: user.id });
        targetUserId = user.id;
        console.log('✅ notifyApplicationApproved: Found user by email and updated application', {
          userId: targetUserId,
          email: application.email
        });
      }

      if (!targetUserId) {
        console.log('❌ notifyApplicationApproved: Still no userId after lookup, cannot send notification');
        return;
      }

      console.log('📬 Sending application approved notification:', {
        toUserId: targetUserId,
        applicationId,
        planId: application.planId,
        planName: application.plan?.name,
        applicantEmail: application.email
      });
      
      await sendNotification(
        targetUserId,
        'application_approved',
        'Application Approved!',
        `Your application for ${application.plan?.name || 'membership'} has been approved`,
        `/membership/applications?applicationId=${applicationId}`,
        { applicationId, planId: application.planId }
      );
      
      console.log('✅ notifyApplicationApproved: Notification sent successfully to user', targetUserId);
    } catch (error) {
      console.error('❌ Error notifying application approved:', error);
      console.error('Error stack:', error.stack);
    }
  }

  async notifyApplicationRejected(applicationId) {
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application) return;
      
      await sendNotification(
        application.userId,
        'application_rejected',
        'Application Update',
        `Your application for ${application.plan.name} was not approved`,
        `/membership/applications?applicationId=${applicationId}`,
        { applicationId, planId: application.planId }
      );
    } catch (error) {
      console.error('Error notifying application rejected:', error);
    }
  }

  // Social notifications
  async notifyNewComment(postId, commentId, commenterId) {
    try {
      const post = await Post.findByPk(postId);
      const commenter = await User.findByPk(commenterId);

      if (!post || !commenter) {
        console.log('⚠️ notifyNewComment: Post or commenter not found', { postId, commenterId });
        return;
      }

      // Don't notify if user commented on their own post
      if (post.userId === commenterId) {
        console.log('⚠️ notifyNewComment: User commented on their own post, skipping notification');
        return;
      }

      console.log('📬 Sending comment notification:', {
        toUserId: post.userId,
        postId,
        commentId,
        commenterId
      });

      await sendNotification(
        post.userId, // Use userId instead of authorId
        'new_comment',
        'New Comment',
        `${commenter.firstName || commenter.username} commented on your post`,
        `/dashboard?postId=${postId}&commentId=${commentId}`,
        { postId, commentId, commenterId }
      );
    } catch (error) {
      console.error('❌ Error notifying new comment:', error);
    }
  }

  async notifyNewFollower(followerId, followedUserId) {
    try {
      const follower = await User.findByPk(followerId);

      if (!follower) return;

      await sendNotification(
        followedUserId,
        'new_follower',
        'New Follower',
        `${follower.firstName || follower.username} started following you`,
        `/profile/${follower.username}`,
        { followerId }
      );
    } catch (error) {
      console.error('Error notifying new follower:', error);
    }
  }

  async notifyPostLiked(postId, likerId) {
    try {
      const post = await Post.findByPk(postId);
      const liker = await User.findByPk(likerId);

      if (!post || !liker) {
        console.log('⚠️ notifyPostLiked: Post or liker not found', { postId, likerId });
        return;
      }

      // Don't notify if user liked their own post
      if (post.userId === likerId) {
        console.log('⚠️ notifyPostLiked: User liked their own post, skipping notification');
        return;
      }

      console.log('📬 Sending like notification:', {
        toUserId: post.userId,
        postId,
        likerId
      });

      await sendNotification(
        post.userId, // Use userId instead of authorId
        'post_liked',
        'Post Liked',
        `${liker.firstName || liker.username} liked your post`,
        `/dashboard?postId=${postId}`,
        { postId, likerId }
      );
    } catch (error) {
      console.error('❌ Error notifying post liked:', error);
    }
  }

  // Payment notifications
  async notifyPaymentReceived(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId, {
        include: [
          { model: User, as: 'user' },
          { model: Plan, as: 'plan' }
        ]
      });

      if (!payment || !payment.user || !payment.plan) return;

      await sendNotification(
        payment.userId,
        'payment_received',
        'Payment Received',
        `Your payment of $${payment.amount} for ${payment.plan.name} has been received`,
        `/membership/payments`,
        { paymentId }
      );
    } catch (error) {
      console.error('Error notifying payment received:', error);
    }
  }

  // Job application notifications
  async notifyJobApplicationSubmitted(jobApplicationId) {
    try {
      console.log('🔍 notifyJobApplicationSubmitted: Starting', { jobApplicationId });
      
      const jobApplication = await JobApplication.findByPk(jobApplicationId, {
        include: [
          { 
            model: User, 
            as: 'applicant',
            attributes: ['id', 'firstName', 'lastName', 'username']
          },
          { 
            model: Job, 
            as: 'job',
            include: [
              {
                model: User,
                as: 'employer',
                attributes: ['id']
              }
            ]
          }
        ]
      });

      if (!jobApplication || !jobApplication.job) {
        console.log('⚠️ notifyJobApplicationSubmitted: Job application or job not found', { jobApplicationId });
        return;
      }

      const employerId = jobApplication.job.userId;
      if (!employerId) {
        console.log('⚠️ notifyJobApplicationSubmitted: Job has no employer', { 
          jobApplicationId,
          jobId: jobApplication.job.id 
        });
        return;
      }

      const applicantName = jobApplication.applicant 
        ? `${jobApplication.applicant.firstName || ''} ${jobApplication.applicant.lastName || ''}`.trim() || jobApplication.applicant.username
        : 'A candidate';

      console.log('📬 Sending job application submitted notification:', {
        toUserId: employerId,
        jobApplicationId,
        jobId: jobApplication.job.id,
        jobTitle: jobApplication.job.title,
        applicantName
      });

      await sendNotification(
        employerId,
        'job_application_submitted',
        'New Job Application',
        `${applicantName} applied for "${jobApplication.job.title}"`,
        `/career/job/${jobApplication.job.id}?tab=applications&applicationId=${jobApplicationId}`,
        { jobApplicationId, jobId: jobApplication.job.id, applicantId: jobApplication.applicantId }
      );
      
      console.log('✅ notifyJobApplicationSubmitted: Notification sent successfully');
    } catch (error) {
      console.error('❌ Error notifying job application submitted:', error);
      console.error('Error stack:', error.stack);
    }
  }

  async notifyJobApplicationStatus(jobApplicationId, status) {
    try {
      const jobApplication = await JobApplication.findByPk(jobApplicationId, {
        include: [
          { model: User, as: 'applicant' },
          { model: Job, as: 'job' }
        ]
      });

      if (!jobApplication || !jobApplication.job) return;

      const statusMessages = {
        'reviewing': 'Your application is being reviewed',
        'shortlisted': 'Congratulations! You\'ve been shortlisted',
        'interview': 'You\'ve been selected for an interview',
        'rejected': 'Your application was not selected',
        'accepted': 'Congratulations! You\'ve been accepted'
      };

      await sendNotification(
        jobApplication.applicantId,
        'job_application_status',
        'Job Application Update',
        `${statusMessages[status] || 'Status updated'} for ${jobApplication.job.title}`,
        `/career`,
        { jobApplicationId, status }
      );
    } catch (error) {
      console.error('Error notifying job application status:', error);
    }
  }
}

module.exports = new NotificationService();
