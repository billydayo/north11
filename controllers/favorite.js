const { dataSource } = require('../db/data-source');
const Favorite = require('../entities/Favorite');
const Store = require('../entities/Store');

async function addFavorite(req , res) {
    const userId = req.user.id;
    const storeId = req.params.storeId;
    const category = req.body.category;

    const storeRepo = dataSource.getRepository(Store);
    const favoriteRepo = dataSource.getRepository(Favorite);

    // const store = await storeRepo.findOneBy({id: storeId});
    const store = await storeRepo.findOneBy({id: userId});
    if(!store){
        return res.status(404).json({
            message: '找不到店家'
        });
    };

    const exists = await favoriteRepo.findOne({
        where:{
            user: {id: userId},
            store: {id: storeId}
        }
    });
    if(exists){
        return res.status(200).json({
            message: '已收藏'
        })
    };

    const favorite = favoriteRepo.create({
        store: {id: storeId},
        category :category
    });

    await favoriteRepo.save(favorite);
    res.status(201).json({ 
        message: '已加入收藏'
    })
}

async function removeFavorite (req,res) {
    const userId = req.user.id;
    const storeId = req.params.storeId;

    const favoriteRepo = dataSource.getRepository(Favorite);

    const favorite = await favoriteRepo.findOne({
        where: {
            user: { id: userId },
            store: { id: storeId }
        }
    });

    if (!favorite){
        return res.status(404).json({ 
            message: '未找到收藏'
        });
    } 

    await favoriteRepo.remove(favorite);
    res.status(200).json({
        message: '已移除收藏' 
    });
}

module.exports = {addFavorite,removeFavorite};