const { dataSource } = require('../db/data-source');
const Favorite = require('../entities/Favorite');
const User = require('../entities/User');

async function addFavorite(req , res) {
    // const userId = req.user.id;
    const userId = req.params.userId;
    const category = req.body.category;
    const userRole = req.user.role;

    const userRepo = dataSource.getRepository(User);
    const favoriteRepo = dataSource.getRepository(Favorite);
    if(userRole != store){
        const store = await userRepo.findOneBy({id: userId});
        if(!store){
            return res.status(404).json({
                message: '找不到店家'
            });
        };

        const exists = await favoriteRepo.findOne({
            where:{
                // user: {id: userId},
                store: {id: userId}
            }
        });
        if(exists){
            return res.status(200).json({
                message: '已收藏'
            })
        };

        const favorite = favoriteRepo.create({
            store: {id: userId},
            category :category
        });

        await favoriteRepo.save(favorite);
        res.status(201).json({ 
            message: '已加入收藏'
        })
        }
    }
    async function removeFavorite (req,res) {
        // const userId = req.user.id;
        const userId = req.params.userId;

        const favoriteRepo = dataSource.getRepository(Favorite);

        const favorite = await favoriteRepo.findOne({
            where: {
                // user: { id: userId },
                store: { id: userId }
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