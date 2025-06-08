exports.getBoard = async (req, res) => {
  try {
    console.log('Fetching board with ID:', req.params.id);
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          model: 'Card',
          populate: [
            { path: 'members', select: 'name email' },
            { path: 'labels' },
            { path: 'comments.user', select: 'name email' }
          ]
        }
      })
      .lean();

    if (!board) {
      console.log('Board not found:', req.params.id);
      return res.status(404).json({ message: 'Board not found' });
    }

    console.log('Found board:', board.title, 'with', board.lists?.length || 0, 'lists');
    
    // Transform _id to id for consistency
    const transformedBoard = {
      ...board,
      id: board._id.toString(),
      lists: (board.lists || []).map(list => ({
        ...list,
        id: list._id.toString(),
        cards: (list.cards || []).map(card => ({
          ...card,
          id: card._id.toString(),
          members: (card.members || []).map(member => ({
            ...member,
            id: member._id.toString()
          })),
          labels: (card.labels || []).map(label => ({
            ...label,
            id: label._id.toString()
          }))
        }))
      }))
    };

    delete transformedBoard._id;
    transformedBoard.lists.forEach(list => {
      delete list._id;
      list.cards.forEach(card => {
        delete card._id;
        card.members.forEach(member => delete member._id);
        card.labels.forEach(label => delete label._id);
      });
    });

    console.log('Sending transformed board data');
    res.json(transformedBoard);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Error fetching board', error: error.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    console.log('Fetching boards for user:', req.user._id);
    const boards = await Board.find({ 
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .populate({
      path: 'lists',
      populate: {
        path: 'cards',
        model: 'Card',
        populate: [
          { path: 'members', model: 'User', select: 'name email' },
          { path: 'labels' },
          { path: 'comments.user', model: 'User', select: 'name email' }
        ]
      }
    })
    .lean();

    console.log('Found boards:', boards.length);

    // Transform _id to id for consistency
    const transformedBoards = boards.map(board => ({
      ...board,
      id: board._id.toString(),
      lists: (board.lists || []).map(list => ({
        ...list,
        id: list._id.toString(),
        cards: (list.cards || []).map(card => ({
          ...card,
          id: card._id.toString(),
          members: (card.members || []).map(member => ({
            ...member,
            id: member._id.toString()
          })),
          labels: (card.labels || []).map(label => ({
            ...label,
            id: label._id.toString()
          }))
        }))
      }))
    }));

    // Remove _id fields
    transformedBoards.forEach(board => {
      delete board._id;
      board.lists.forEach(list => {
        delete list._id;
        list.cards.forEach(card => {
          delete card._id;
          card.members.forEach(member => delete member._id);
          card.labels.forEach(label => delete label._id);
        });
      });
    });

    console.log('Sending transformed boards:', transformedBoards.length);
    res.json(transformedBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Error fetching boards', error: error.message });
  }
}; 