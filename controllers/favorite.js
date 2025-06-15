const { dataSource } = require('../db/data-source');
const Favorite = require('../entities/Favorite');
const User = require('../entities/User');

//新增最愛
async function addFavorite(req , res) {
    try{
        const userId = req.user.id; //收藏者ID
        const storeId = req.params.userId; //被收藏ID
        const category = req.body.category;
        const userRole = req.user.role;

        const userRepo = dataSource.getRepository(User);
        const favoriteRepo = dataSource.getRepository(Favorite);

        if(userRole !== 'store'){
            const store = await userRepo.findOneBy({id: storeId});
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
                user: {id: userId},
                store: {id: storeId},
                category :category
            });

            await favoriteRepo.save(favorite);
            res.status(201).json({ 
                message: '已加入收藏'
            });
        }
    }catch(error){
        console.error('新增收藏錯誤:', error);
        return res.status(500).json({
            message: '伺服器錯誤', error: error.message 
        });
    }
    
    }


    //移除最愛
async function removeFavorite (req,res) {
    try{
        const userId = req.user.id;
        const storeId = req.params.userId;

        const favoriteRepo = dataSource.getRepository(Favorite);

        const favorite = await favoriteRepo.findOne({
            where: {
                user: { id: userId },
                tore: { id: userId }
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
    }catch(error){
        console.error('移除收藏錯誤:', error); 
        return res.status(500).json({
            message: '伺服器錯誤', error: error.message 
        });
    }
    
    }

module.exports = {addFavorite,removeFavorite};