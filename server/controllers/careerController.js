const { body } = require('express-validator');
const { Job, JobApplication, SavedJob, User, UserProfile, IndividualProfile, CompanyProfile } = require('../models');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');

// Validation rules
const createJobValidation = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Job title must be between 1 and 255 characters'),
  body('description')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Job description must be between 1 and 5000 characters'),
  body('category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('jobType')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  body('location')
    .isLength({ min: 1, max: 255 })
    .withMessage('Location must be between 1 and 255 characters'),
  body('experienceLevel')
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
];

const updateUserTypeValidation = [
  body('userType')
    .isIn(['individual', 'company'])
    .withMessage('User type must be either individual or company'),
];

// Update user type (individual/company)
const updateUserType = async (req, res) => {
  try {
    const { userType, ...additionalData } = req.body;

    // Get or create user profile
    let userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!userProfile) {
      userProfile = await UserProfile.create({
        userId: req.user.id,
        userType: userType || 'individual'
      });
    } else {
      await userProfile.update({ userType });
    }

    // Handle specific profile data based on user type
    if (userType === 'individual') {
      const { resume, workExperience, jobPreferences } = additionalData;
      
      let individualProfile = await IndividualProfile.findOne({
        where: { userId: req.user.id }
      });

      if (!individualProfile) {
        individualProfile = await IndividualProfile.create({
          userId: req.user.id,
          resume,
          workExperience,
          jobPreferences
        });
      } else {
        await individualProfile.update({
          resume,
          workExperience,
          jobPreferences
        });
      }
    } else if (userType === 'company') {
      const { companyName, companyLogo, industry, companySize, website, location } = additionalData;
      
      let companyProfile = await CompanyProfile.findOne({
        where: { userId: req.user.id }
      });

      if (!companyProfile) {
        companyProfile = await CompanyProfile.create({
          userId: req.user.id,
          companyName,
          companyLogo,
          industry,
          companySize,
          website,
          location
        });
      } else {
        await companyProfile.update({
          companyName,
          companyLogo,
          industry,
          companySize,
          website,
          location
        });
      }
    }

    // Get updated user with profiles
    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserProfile,
          as: 'profile'
        },
        {
          model: IndividualProfile,
          as: 'individualProfile'
        },
        {
          model: CompanyProfile,
          as: 'companyProfile'
        }
      ]
    });

    res.json({
      success: true,
      message: 'User type updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Update user type error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Create new job posting
const createJob = async (req, res) => {
  try {
    // Check if user is a company
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!userProfile || userProfile.userType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can post jobs',
      });
    }

    const jobData = {
      ...req.body,
      userId: req.user.id,
    };

    const job = await Job.create(jobData);

    // Get job with employer information
    const jobWithEmployer = await Job.findByPk(job.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          include: [
            {
              model: CompanyProfile,
              as: 'companyProfile',
              attributes: ['companyName', 'companyLogo', 'industry', 'location']
            }
          ]
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: {
        job: jobWithEmployer,
      },
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update existing job posting
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if user is a company
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!userProfile || userProfile.userType !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can update jobs',
      });
    }

    // Find the job and check ownership
    const job = await Job.findOne({
      where: { 
        id: jobId,
        userId: req.user.id // Ensure user owns the job
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to edit it',
      });
    }

    // Update the job
    await job.update(req.body);

    // Get updated job with employer information
    const updatedJob = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          include: [
            {
              model: CompanyProfile,
              as: 'companyProfile',
              attributes: ['companyName', 'companyLogo', 'industry', 'location']
            }
          ]
        },
      ],
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job: updatedJob,
      },
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all jobs with filters
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const {
      search,
      location,
      jobType,
      category,
      experienceLevel,
      remoteWork,
      salaryMin,
      salaryMax,
    } = req.query;

    let whereClause = {
      status: 'active',
    };

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { requirements: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Location filter
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    // Job type filter
    if (jobType) {
      whereClause.jobType = jobType;
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Experience level filter
    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    // Remote work filter
    if (remoteWork !== undefined) {
      whereClause.remoteWork = remoteWork === 'true';
    }

    // Salary filters
    if (salaryMin || salaryMax) {
      whereClause.salaryMin = {};
      if (salaryMin) whereClause.salaryMin[Op.gte] = parseInt(salaryMin);
      if (salaryMax) whereClause.salaryMax = { [Op.lte]: parseInt(salaryMax) };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          include: [
            {
              model: CompanyProfile,
              as: 'companyProfile',
              attributes: ['companyName', 'companyLogo', 'industry']
            }
          ]
        },
      ],
    });

    // Check if user has saved each job
    const jobsWithSavedStatus = await Promise.all(
      jobs.map(async (job) => {
        let isSaved = false;
        if (req.user) {
          const userProfile = await UserProfile.findOne({
            where: { userId: req.user.id }
          });
          if (userProfile && userProfile.userType === 'individual') {
            const savedJob = await SavedJob.findOne({
              where: {
                userId: req.user.id,
                jobId: job.id,
              },
            });
            isSaved = !!savedJob;
          }
        }

        const jobData = job.toJSON();
        jobData.isSaved = isSaved;
        return jobData;
      })
    );

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs: jobsWithSavedStatus,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          include: [
            {
              model: CompanyProfile,
              as: 'companyProfile',
              attributes: ['companyName', 'companyLogo', 'industry', 'location']
            }
          ]
        },
      ],
    });

    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user has saved this job
    let isSaved = false;
    if (req.user) {
      const userProfile = await UserProfile.findOne({
        where: { userId: req.user.id }
      });
      if (userProfile && userProfile.userType === 'individual') {
        const savedJob = await SavedJob.findOne({
          where: {
            userId: req.user.id,
            jobId: job.id,
          },
        });
        isSaved = !!savedJob;
      }
    }

    const jobData = job.toJSON();
    jobData.isSaved = isSaved;

    res.json({
      success: true,
      data: {
        job: jobData,
      },
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    console.log('Apply for job request:', {
      body: req.body,
      file: req.file,
      params: req.params
    });

    // Check if user is an individual
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!userProfile || userProfile.userType !== 'individual') {
      return res.status(403).json({
        success: false,
        message: 'Only individuals can apply for jobs',
      });
    }

    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    // Handle resume file upload
    let resumePath = null;
    if (req.file) {
      // Store the relative path for database
      resumePath = `/uploads/${req.file.filename}`;
    }

    // Check if job exists and is active
    const job = await Job.findByPk(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not active',
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      where: {
        jobId,
        applicantId: req.user.id,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    const application = await JobApplication.create({
      jobId,
      applicantId: req.user.id,
      coverLetter,
      resume: resumePath,
    });

    const applicationWithDetails = await JobApplication.findByPk(application.id, {
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'username', 'firstName', 'lastName'],
              include: [
                {
                  model: CompanyProfile,
                  as: 'companyProfile',
                  attributes: ['companyName']
                }
              ]
            },
          ],
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: applicationWithDetails,
      },
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get user's job applications
const getUserApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: {
        applicantId: req.user.id,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'username', 'firstName', 'lastName'],
              include: [
                {
                  model: CompanyProfile,
                  as: 'companyProfile',
                  attributes: ['companyName', 'companyLogo']
                }
              ]
            },
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalApplications: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Save/unsave a job
const toggleSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is an individual
    const userProfile = await UserProfile.findOne({
      where: { userId: req.user.id }
    });
    
    if (!userProfile || userProfile.userType !== 'individual') {
      return res.status(403).json({
        success: false,
        message: 'Only individuals can save jobs',
      });
    }

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const existingSavedJob = await SavedJob.findOne({
      where: {
        userId: req.user.id,
        jobId,
      },
    });

    if (existingSavedJob) {
      // Unsave job
      await existingSavedJob.destroy();
      res.json({
        success: true,
        message: 'Job removed from saved jobs',
        data: { isSaved: false },
      });
    } else {
      // Save job
      await SavedJob.create({
        userId: req.user.id,
        jobId,
      });
      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { isSaved: true },
      });
    }
  } catch (error) {
    console.error('Toggle saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get user's saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: savedJobs } = await SavedJob.findAndCountAll({
      where: {
        userId: req.user.id,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Job,
          as: 'job',
          where: { status: 'active' },
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'username', 'firstName', 'lastName'],
              include: [
                {
                  model: CompanyProfile,
                  as: 'companyProfile',
                  attributes: ['companyName', 'companyLogo', 'industry']
                }
              ]
            },
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs: savedJobs.map(savedJob => savedJob.job),
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get company's posted jobs
const getCompanyJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const requestedLimit = parseInt(req.query.limit) || 20;
    const limit = requestedLimit > 1000 ? 1000 : Math.min(1000, Math.max(1, requestedLimit));
    const offset = (page - 1) * limit;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: {
        userId: req.user.id,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: JobApplication,
          as: 'applications',
          include: [
            {
              model: User,
              as: 'applicant',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update job status
const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const job = await Job.findOne({
      where: {
        id: jobId,
        userId: req.user.id,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    await job.update({ status });

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get applications for company's jobs
const getCompanyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const requestedLimit = parseInt(req.query.limit) || 10;
    const limit = requestedLimit > 1000 ? 1000 : Math.min(1000, Math.max(1, requestedLimit));
    const offset = (page - 1) * limit;
    const status = req.query.status; // Filter by application status
    const jobId = req.query.jobId; // Filter by specific job

    // Build where clause for applications
    const applicationWhere = {};
    if (status && status !== 'null') {
      applicationWhere.status = status;
    }

    // Build where clause for jobs (only company's jobs)
    const jobWhere = { userId };
    if (jobId && jobId !== 'null') {
      jobWhere.id = jobId;
    }

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: applicationWhere,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          include: [
            {
              model: IndividualProfile,
              as: 'individualProfile',
              attributes: ['resume', 'workExperience'],
              required: false
            }
          ]
        },
        {
          model: Job,
          as: 'job',
          where: jobWhere,
          attributes: ['id', 'title', 'location', 'jobType', 'category'],
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'firstName', 'lastName'],
              include: [
                {
                  model: CompanyProfile,
                  as: 'companyProfile',
                  attributes: ['companyName', 'industry'],
                }
              ]
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalApplications: count,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message,
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: 'job',
          where: { userId: req.user.id },
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    await application.update({ status, notes });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application },
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get company analytics
const getCompanyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({
      where: { userId }
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Get basic stats
    const totalJobs = await Job.count({
      where: { userId }
    });

    const totalApplications = await JobApplication.count({
      include: [{
        model: Job,
        as: 'job',
        where: { userId }
      }]
    });

    const activeJobs = await Job.count({
      where: { 
        userId,
        status: 'active'
      }
    });

    const pendingApplications = await JobApplication.count({
      where: { status: 'pending' },
      include: [{
        model: Job,
        as: 'job',
        where: { userId }
      }]
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await JobApplication.count({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        }
      },
      include: [{
        model: Job,
        as: 'job',
        where: { userId }
      }]
    });

    const analytics = {
      totalUsers: totalApplications, // Total unique applicants
      activeProjects: activeJobs, // Active job postings
      totalRevenue: 0, // Placeholder - could be calculated from paid features
      pendingTasks: pendingApplications, // Pending applications to review
      totalJobs,
      totalApplications,
      recentApplications,
      companyName: companyProfile.companyName
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get company analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data',
      error: error.message,
    });
  }
};

module.exports = {
  updateUserType: [updateUserTypeValidation, handleValidationErrors, updateUserType],
  createJob: [createJobValidation, handleValidationErrors, createJob],
  updateJob: [createJobValidation, handleValidationErrors, updateJob],
  getJobs,
  getJob,
  applyForJob,
  getUserApplications,
  toggleSavedJob,
  getSavedJobs,
  getCompanyJobs,
  updateJobStatus,
  getCompanyApplications,
  updateApplicationStatus,
  getCompanyAnalytics,
};
