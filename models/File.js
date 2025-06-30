import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Sequelize 인스턴스 가져오기

const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    filename: { // 저장된 파일 이름 (예: file-1629878392-random.jpg)
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    originalname: { // 사용자가 업로드한 원본 파일 이름
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimetype: { // 파일 타입 (예: image/jpeg)
        type: DataTypes.STRING,
        allowNull: false,
    },
    size: { // 파일 크기 (bytes)
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    path: { // 파일이 서버에 저장된 실제 경로
        type: DataTypes.STRING,
        allowNull: false,
    },
    // userId: { // 파일을 업로드한 사용자 ID (필요한 경우)
    //     type: DataTypes.INTEGER,
    //     allowNull: true, // 또는 false, 애플리케이션 요구사항에 따라
    //     references: {
    //         model: 'Users', // 'Users' 테이블 참조
    //         key: 'id',
    //     },
    // },
}, {
    timestamps: true, // createdAt, updatedAt 자동 생성
    tableName: 'files', // 데이터베이스 테이블 이름 명시
});

export default File;
