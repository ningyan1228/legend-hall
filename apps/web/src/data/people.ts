import type { Person } from '@legend/shared';
import { apiUrl, mediaUrl } from './media';

const avatarPath = (slug: string) => `/images/people/${slug}/avatar.jpg`;
const person = (
  slug: string,
  nameZh: string,
  nameEn: string,
  category: Person['category'],
  nationality: string,
  status: Person['status'] = 'active',
): Person => ({
  id: slug,
  slug,
  nameZh,
  nameEn,
  nickname: '',
  category,
  nationality,
  birthDate: '1980-01-01',
  birthPlace: '',
  summary: `${nameZh}是享誉世界的传奇人物。`,
  biography: `${nameZh}以卓越成就、持久影响力和独特风格成为时代代表人物。`,
  avatarUrl: avatarPath(slug),
  coverUrl: '',
  status,
  featured: true,
  keywords: [nameZh, nameEn],
  views: 0,
});

export const fallbackPeople: Person[] = [
  {
    ...person('lionel-messi', '梅西', 'Lionel Messi', 'football', '阿根廷'),
    birthDate: '1987-06-24',
    birthPlace: '罗萨里奥',
    summary: '阿根廷足球运动员，世界杯冠军、八次金球奖得主，被广泛视为足球史上最杰出的球员之一。',
    biography: '梅西出生于阿根廷罗萨里奥，少年时期加入巴塞罗那青训体系。他凭借盘带、组织和得分能力赢得众多荣誉，并于2022年带领阿根廷国家队夺得世界杯。',
  },
  {...person('cristiano-ronaldo', 'C罗', 'Cristiano Ronaldo', 'football', '葡萄牙'), birthDate:'1985-02-05', birthPlace:'丰沙尔', summary:'葡萄牙足球运动员，五届金球奖得主，以惊人的进球能力、身体素质和职业生涯长度闻名。', biography:'C罗出生于马德拉岛丰沙尔，少年时期进入葡萄牙体育青训，随后效力曼联、皇家马德里、尤文图斯与利雅得胜利。他五次赢得欧洲冠军联赛，并于2016年以队长身份帮助葡萄牙首夺欧洲杯。'},
  {...person('pele', '贝利', 'Pelé', 'football', '巴西', 'deceased'), birthDate:'1940-10-23', deathDate:'2022-12-29', birthPlace:'特雷斯科拉松伊斯', summary:'巴西足球传奇，历史上唯一三次夺得世界杯的球员，被誉为“球王”。', biography:'贝利十五岁代表桑托斯完成一线队首秀，十七岁帮助巴西赢得1958年世界杯。他又参加并赢得1962年与1970年世界杯，成为足球最早的全球文化偶像之一。'},
  {...person('diego-maradona', '马拉多纳', 'Diego Maradona', 'football', '阿根廷', 'deceased'), birthDate:'1960-10-30', deathDate:'2020-11-25', birthPlace:'拉努斯', summary:'阿根廷足球传奇，以非凡的控球、创造力和1986年世界杯的统治级表现载入史册。', biography:'马拉多纳成长于布宜诺斯艾利斯南郊，十五岁进入职业赛场。1984年加盟那不勒斯后，他带领球队两夺意甲冠军；1986年又以队长身份率阿根廷夺得世界杯。'},
  {...person('neymar', '内马尔', 'Neymar', 'football', '巴西'), birthDate:'1992-02-05', birthPlace:'莫吉达斯克鲁济斯', summary:'巴西足球运动员，以华丽盘带、创造力和得分能力成为其时代最具辨识度的攻击手之一。', biography:'内马尔出自桑托斯青训，2011年帮助球队夺得南美解放者杯。加盟巴塞罗那后，他随队赢得2015年欧洲冠军联赛，并在2016年帮助巴西获得队史首枚奥运男足金牌。'},
  {...person('kylian-mbappe', '姆巴佩', 'Kylian Mbappé', 'football', '法国'), birthDate:'1998-12-20', birthPlace:'巴黎', summary:'法国足球运动员，2018年世界杯冠军，以爆发速度和大赛得分能力闻名。', biography:'姆巴佩在巴黎郊区邦迪成长，十六岁完成摩纳哥一线队首秀。2018年他随法国夺得世界杯并在决赛进球；2022年世界杯决赛上演帽子戏法，获得赛事金靴奖。'},
  {...person('stephen-chow', '周星驰', 'Stephen Chow', 'film', '中国香港'), birthDate:'1962-06-22', birthPlace:'香港', summary:'华语电影演员、导演、编剧与制片人，以独特的“无厘头”喜剧风格影响数代观众。', biography:'周星驰从电视台艺员训练班起步，凭《霹雳先锋》获金马奖最佳男配角。《赌圣》确立其票房地位；此后他通过《少林足球》《功夫》等作品完成从喜剧明星到作者型导演的转变。'},
  {...person('leslie-cheung', '张国荣', 'Leslie Cheung', 'film', '中国香港', 'deceased'), birthDate:'1956-09-12', deathDate:'2003-04-01', birthPlace:'香港', summary:'香港歌手、演员与表演艺术家，在音乐、电影和舞台美学上均留下深远影响。', biography:'张国荣于1977年进入演艺界，1983年凭《风继续吹》走红。电影方面，他凭《阿飞正传》获得香港电影金像奖最佳男主角，并以《霸王别姬》《春光乍泄》等作品成为国际影坛重要的华语演员。'},
  {...person('tan-jianci', '檀健次', 'JC-T', 'film', '中国'), birthDate:'1990-10-05', birthPlace:'广西北海', summary:'中国内地演员、歌手与舞者，以细腻的角色塑造和多栖舞台能力受到关注。', biography:'檀健次毕业于北京体育大学体育舞蹈专业，2010年以MIC男团成员身份出道。此后转向影视表演，凭《军师联盟》《猎罪图鉴》《长相思》等作品逐步建立演员代表作。'},
  {...person('liu-yifei', '刘亦菲', 'Liu Yifei', 'film', '美国'), birthDate:'1987-08-25', birthPlace:'湖北武汉', summary:'华语影视演员、歌手，凭古装剧、电影和国际制作中的多样角色广受关注。', biography:'刘亦菲十五岁进入北京电影学院表演系，早期因《金粉世家》《天龙八部》《仙剑奇侠传》《神雕侠侣》走红；其后主演《功夫之王》、迪士尼真人电影《花木兰》以及剧集《梦华录》《玫瑰的故事》。'},
  {...person('gillian-chung', '阿娇', 'Gillian Chung', 'film', '中国香港'), birthDate:'1981-01-21', birthPlace:'香港', summary:'香港歌手、演员，女子组合Twins成员，在流行音乐与影视领域持续发展。', biography:'钟欣潼以“阿娇”为艺名，2001年与蔡卓妍组成Twins出道。组合成为千禧年代代表性华语女子团体之一；她亦出演《公主复仇记》《前度》等电影，并持续发行个人音乐作品。'},
  {
    ...person('joker-xue', '薛之谦', 'Joker Xue', 'music', '中国'),
    birthDate: '1983-07-17',
    birthPlace: '上海',
    summary: '中国内地创作男歌手、音乐制作人，以《认真的雪》《演员》等作品广为人知。',
    biography: '薛之谦于2005年通过音乐选秀节目出道，长期参与词曲创作，并以鲜明的叙事型情歌和现场演出形成个人风格。',
  },
];

const curatedSlugs = fallbackPeople.map(({ slug }) => slug);

export async function getPeople() {
  try {
    const endpoint = apiUrl('people');
    if (!endpoint) return fallbackPeople;
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('People API unavailable');
    const apiPeople = (await response.json()).data as Person[];
    const apiBySlug = new Map(apiPeople.map((item) => [item.slug, item]));
    return curatedSlugs.map((slug) => {
      const fallback = fallbackPeople.find((item) => item.slug === slug)!;
      const remote = apiBySlug.get(slug);
      return {
        ...fallback,
        ...(remote ?? {}),
        views: remote?.views ?? fallback.views,
        avatarUrl: remote ? mediaUrl(`people/${slug}/card`, avatarPath(slug)) : avatarPath(slug),
        coverUrl: remote ? mediaUrl(`people/${slug}/hero`, avatarPath(slug)) : avatarPath(slug),
      };
    });
  } catch {
    return fallbackPeople;
  }
}
