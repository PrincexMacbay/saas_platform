const { sendNotification } = require('../socket/socketServer');
const { User, Post, Comment, Application, Plan, JobApplication, Job } = require('../models');

class NotificationService {
  // Application notifications
  async notifyApplicationSubmitted(applicationId) {
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application || !application.plan) return;

      // Notify plan creator
      await sendNotification(
        application.plan.createdBy,
        'application_submitted',
        'New Membership Application',
        `A new application has been submitted for ${application.plan.name}`,
        `/admin?section=memberships&applicationId=${applicationId}`,
        { applicationId, planId: application.planId }
      );
    } catch (error) {
      console.error('Error notifying application submitted:', error);
    }
  }

  async notifyApplicationApproved(applicationId) {
    try {
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Plan, as: 'plan' }]
      });
      
      if (!application) return;
      
      await sendNotification(
        application.userId,
        'application_approved',
        'Application Approved!',
        `Your application for ${application.plan.name} has been approved`,
        `/membership`,
        { applicationId, planId: application.planId }
      );
    } catch (error) {
      console.error('Error notifying application approved:', error);
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
      const post = await Post.findByPk(postId, {
        include: [{ model: User, as: 'author' }]
      });
      const commenter = await User.findByPk(commenterId);

      if (!post || !commenter) return;

      // Don't notify if user commented on their own post
      if (post.authorId === commenterId) return;

      await sendNotification(
        post.authorId,
        'new_comment',
        'New Comment',
        `${commenter.firstName || commenter.username} commented on your post`,
        `/posts/${postId}`,
        { postId, commentId, commenterId }
      );
    } catch (error) {
      console.error('Error notifying new comment:', error);
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
      const post = await Post.findByPk(postId, { 
        include: [{ model: User, as: 'author' }] 
      });
      const liker = await User.findByPk(likerId);

      if (!post || !liker) return;

      if (post.authorId === likerId) return;

      await sendNotification(
        post.authorId,
        'post_liked',
        'Post Liked',
        `${liker.firstName || liker.username} liked your post`,
        `/posts/${postId}`,
        { postId, likerId }
      );
    } catch (error) {
      console.error('Error notifying post liked:', error);
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
