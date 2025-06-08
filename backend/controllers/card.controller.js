exports.createCard = async (req, res) => {
  try {
    const { title, listId, position } = req.body;
    console.log('Creating card:', { title, listId, position });

    if (!title || !listId) {
      return res.status(400).json({ message: 'Title and list ID are required' });
    }

    // Find the list to ensure it exists
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Create the card
    const card = new Card({
      title,
      listId,
      position: position || await getNextCardPosition(listId),
      members: [],
      labels: [],
      dueDate: null,
      description: '',
    });

    console.log('Saving new card:', card);
    await card.save();

    // Add card to list
    list.cards.push(card._id);
    await list.save();

    // Transform the response
    const transformedCard = {
      id: card._id.toString(),
      title: card.title,
      description: card.description,
      position: card.position,
      listId: card.listId.toString(),
      members: [],
      labels: [],
      dueDate: null,
    };

    console.log('Card created successfully:', transformedCard);
    res.status(201).json(transformedCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Error creating card', error: error.message });
  }
};

async function getNextCardPosition(listId) {
  const lastCard = await Card.findOne({ listId })
    .sort({ position: -1 })
    .limit(1);

  return lastCard ? lastCard.position + 65536 : 65536;
} 