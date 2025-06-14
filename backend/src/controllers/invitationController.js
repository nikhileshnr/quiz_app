const Invitation = require('../models/invitationModel');
const Quiz = require('../models/quizModel');
const User = require('../models/userModel');

/**
 * Invite students to a quiz
 * @route POST /api/invitation/quiz/:quizId
 * @access Private - Teachers only
 */
exports.inviteToQuiz = async (req, res) => {
  try {
    // Only teachers can send invitations
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can invite students to quizzes'
      });
    }
    
    // Check if quiz exists and belongs to this teacher
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only invite students to your own quizzes"
      });
    }
    
    // Get the student IDs from request body
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one student ID'
      });
    }
    
    // Verify all IDs belong to students
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    }).select('_id');
    
    const validStudentIds = students.map(student => student._id.toString());
    
    const invalidIds = studentIds.filter(id => !validStudentIds.includes(id.toString()));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some of the provided IDs do not belong to students',
        invalidIds
      });
    }
    
    // Create invitations (ignoring duplicates)
    const invitationsToCreate = validStudentIds.map(studentId => ({
      quiz: quiz._id,
      teacher: req.user.id,
      student: studentId,
      status: 'pending'
    }));
    
    // Use insertMany with ordered: false to continue even if some fail due to duplicates
    const result = await Invitation.insertMany(invitationsToCreate, { ordered: false })
      .catch(err => {
        // Extract the successful inserts if there are duplicate key errors
        if (err.name === 'BulkWriteError') {
          return err.insertedDocs;
        }
        throw err; // Re-throw other errors
      });
    
    // Update the quiz's invitedStudents array
    await Quiz.findByIdAndUpdate(quiz._id, {
      $addToSet: { invitedStudents: { $each: validStudentIds } }
    });
    
    res.status(201).json({
      success: true,
      message: `Successfully invited ${result.length} students to the quiz`,
      invitations: result
    });
  } catch (error) {
    console.error('Error inviting students to quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error inviting students to quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all invitations for a teacher's quiz
 * @route GET /api/invitation/quiz/:quizId
 * @access Private - Teachers only
 */
exports.getQuizInvitations = async (req, res) => {
  try {
    // Only teachers can view invitations they've sent
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if quiz exists and belongs to this teacher
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view invitations for your own quizzes"
      });
    }
    
    // Get all invitations for this quiz
    const invitations = await Invitation.find({ quiz: quiz._id })
      .populate('student', 'name email')
      .select('student status invitedAt responseAt');
    
    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching quiz invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all invitations for a student
 * @route GET /api/invitation/student
 * @access Private - Students only
 */
exports.getMyInvitations = async (req, res) => {
  try {
    // Only students can view their own invitations
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view their invitations'
      });
    }
    
    // Get all pending invitations for this student
    const invitations = await Invitation.find({
      student: req.user.id,
      status: 'pending'
    })
      .populate('quiz', 'title difficulty level')
      .populate('teacher', 'name')
      .select('status invitedAt');
    
    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching student invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Respond to an invitation (accept/reject)
 * @route PUT /api/invitation/:invitationId/respond
 * @access Private - Students only
 */
exports.respondToInvitation = async (req, res) => {
  try {
    // Only students can respond to invitations
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can respond to invitations'
      });
    }
    
    const { response } = req.body;
    
    if (!response || !['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Response must be 'accepted' or 'rejected'"
      });
    }
    
    // Find the invitation
    const invitation = await Invitation.findById(req.params.invitationId);
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }
    
    // Check that it belongs to this student
    if (invitation.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to your own invitations"
      });
    }
    
    // Check that it's still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot change response. Invitation is already ${invitation.status}`
      });
    }
    
    // Update the invitation
    invitation.status = response;
    invitation.responseAt = new Date();
    await invitation.save();
    
    res.status(200).json({
      success: true,
      message: `Invitation ${response}`,
      data: invitation
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 