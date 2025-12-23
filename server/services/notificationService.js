const { sendNotification } = require('../socket/socketServer');
const { User, Post, Comment, Application, Plan, JobApplication, Job } = require('../models');

class NotificationService {
  // Application notifications
  async notifyApplicationSubmitted(applicationId) {
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application || !application.plan) {
        console.log('⚠️ notifyApplicationSubmitted: Application or plan not found', { applicationId });
        return;
      }

      const planCreatorId = application.plan.createdBy;
      if (!planCreatorId) {
        console.log('⚠️ notifyApplicationSubmitted: Plan has no creator', { planId: application.planId });
        return;
      }

      console.log('📬 Sending application submitted notification:', {
        toUserId: planCreatorId,
        applicationId,
        planId: application.planId
      });

      // Notify plan creator
      await sendNotification(
        planCreatorId,
        'application_submitted',
        'New Membership Application',
        `A new application has been submitted for ${application.plan.name}`,
        `/admin?section=memberships&applicationId=${applicationId}`,
        { applicationId, planId: application.planId }
      );
    } catch (error) {
      console.error('❌ Error notifying application submitted:', error);
    }
  }

  async notifyApplicationApproved(applicationId) {
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application) {
        console.log('⚠️ notifyApplicationApproved: Application not found', { applicationId });
        return;
      }

      // Application should have userId after approval, but reload to ensure we have latest data
      if (!application.userId) {
        console.log('⚠️ notifyApplicationApproved: Application has no userId, trying to find by email', { applicationId, email: application.email });
        // Try to find user by email
        const { User } = require('../models');
        const user = await User.findOne({ where: { email: application.email } });
        if (!user) {
          console.log('❌ notifyApplicationApproved: User not found by email, cannot send notification', { email: application.email });
          return;
        }
        // Update application with userId for future reference
        await application.update({ userId: user.id });
        application.userId = user.id; // Update local reference
      }

      if (!application.userId) {
        console.log('❌ notifyApplicationApproved: Still no userId after lookup, cannot send notification');
        return;
      }

      console.log('📬 Sending application approved notification:', {
        toUserId: application.userId,
        applicationId,
        planId: application.planId,
        planName: application.plan?.name
      });
      
      await sendNotification(
        application.userId,
        'application_approved',
        'Application Approved!',
        `Your application for ${application.plan?.name || 'membership'} has been approved`,
        `/membership`,
        { applicationId, planId: application.planId }
      );
    } catch (error) {
      console.error('❌ Error notifying application approved:', error);
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
        `/membership`,
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
        `/posts/${postId}`,
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
        `/posts/${postId}`,
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
        `/career/applications/${jobApplicationId}`,
        { jobApplicationId, status }
      );
    } catch (error) {
      console.error('Error notifying job application status:', error);
    }
  }
}

module.exports = new NotificationService();
