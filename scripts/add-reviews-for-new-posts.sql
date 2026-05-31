WITH target_posts AS (
  SELECT
    p.id AS post_id,
    p.created_at AS post_created_at,
    pt.title AS post_title,
    ROW_NUMBER() OVER (ORDER BY p.created_at ASC, p.id ASC) AS rn
  FROM posts p
  INNER JOIN post_translations pt
    ON pt.post_id = p.id
   AND pt.locale = 'vi'
  LEFT JOIN reviews existing_reviews
    ON existing_reviews.post_id = p.id
   AND existing_reviews.status = 'ACTIVE'
  WHERE p.created_at >= TIMESTAMP '2026-05-30 00:00:00'
  GROUP BY p.id, p.created_at, pt.title
  HAVING COUNT(existing_reviews.id) = 0
),
prepared_reviews AS (
  SELECT
    tp.post_id,
    tp.post_created_at,
    tp.post_title,
    gs.seq,
    target_count,
    (ARRAY[
      'Nguyen Minh Quan',
      'Tran Hoang Nam',
      'Le Quoc Bao',
      'Pham Thanh Luan',
      'Vo Gia Han',
      'Dang Thi Yen',
      'Bui Thu Trang',
      'Doan Hai Dang',
      'Hoang Minh Chau',
      'Ngo Tuan Kiet',
      'Phan Bao Ngoc',
      'Truong Quoc Viet',
      'Duong Nhat Linh',
      'Lam Gia Huy',
      'Mai Khanh Linh',
      'Nguyen Bao Chau',
      'Tran Quoc Anh',
      'Le Minh Thu',
      'Phung Thanh Son',
      'Cao Huu Nghi'
    ])[1 + ((tp.post_id + gs.seq) % 20)] AS author_name,
    (ARRAY[
      'Quan ly kho',
      'Truong ca van hanh',
      'Phu trach mua hang',
      'Giam sat logistics',
      'Ky su bao tri',
      'Chu kho xưởng',
      'Dieu phoi kho',
      'Phu trach san xuat',
      'Nhan vien thu mua',
      'Quan ly vat tu'
    ])[1 + ((tp.post_id + gs.seq * 2) % 10)] AS profession,
    CASE
      WHEN gs.seq = target_count AND tp.post_id % 2 = 0 THEN 4
      ELSE 5
    END AS rating,
    (gs.seq = 1) AS featured,
    (
      DATE(tp.post_created_at)
      + (((gs.seq - 1) % 5)::int)
    )::date AS visit_date,
    (
      (
        CURRENT_TIMESTAMP
        - interval '2 minutes'
        - ((tp.post_id % 5)::text || ' seconds')::interval
      )
      - (
        (target_count - gs.seq)::int
        * GREATEST(
          20,
          FLOOR(
            EXTRACT(
              EPOCH FROM (
                (
                  CURRENT_TIMESTAMP
                  - interval '2 minutes'
                  - ((tp.post_id % 5)::text || ' seconds')::interval
                )
                - tp.post_created_at
                - interval '20 seconds'
              )
            ) / GREATEST(target_count - 1, 1)
          )
        )::int
        * interval '1 second'
      )
    ) AS created_at,
    (ARRAY[
      'Bai viet rat de theo doi',
      'Noi dung huu ich cho nguoi dang can chot cau hinh',
      'Thong tin thuc te, de ap dung',
      'Goc nhin ro rang, de so sanh',
      'Doc xong de trao doi voi sale hon'
    ])[1 + ((tp.post_id + gs.seq * 3) % 5)] AS review_title,
    (
      ARRAY[
        'Bai viet trinh bay ro, de hieu va dung nhu nhu cau ben minh dang can.',
        'Noi dung co logic, so sanh de nho, doc xong co them co so de chon xe.',
        'Thong tin dung trong boi canh kho xưởng, nhat la phan luu y khi chot tai trong va cau hinh.',
        'Cach viet ngan gon nhung du y, doi van hanh ben minh doc xong trao doi rat nhanh.',
        'Bai nay giup ben minh hinh dung ro hon truoc khi hoi bao gia va lam viec voi nha cung cap.',
        'Phan giai thich de theo doi, hop voi nguoi can tong hop nhanh truoc khi ra quyet dinh.',
        'Noi dung sat thuc te, khong lan man, nhat la cac diem can kiem tra truoc khi chot xe.',
        'Ben minh tham khao de lam shortlist, thay thong tin kha day du va de doi chieu noi bo.'
      ]
    )[1 + ((tp.post_id * 3 + gs.seq) % 8)] AS review_content
  FROM (
    SELECT
      target_posts.*,
      10 + ((target_posts.rn - 1) % 11) AS target_count
    FROM target_posts
  ) tp
  CROSS JOIN LATERAL generate_series(1, tp.target_count) AS gs(seq)
),
inserted_reviews AS (
  INSERT INTO reviews (
    author_name,
    profession,
    rating,
    post_id,
    visit_date,
    featured,
    status,
    created_at,
    updated_at
  )
  SELECT
    pr.author_name,
    pr.profession,
    pr.rating,
    pr.post_id,
    pr.visit_date,
    pr.featured,
    'ACTIVE',
    pr.created_at,
    pr.created_at
  FROM prepared_reviews pr
  RETURNING id, post_id, created_at
)
INSERT INTO review_translations (
  review_id,
  locale,
  title,
  content,
  created_at,
  updated_at
)
SELECT
  ir.id,
  'vi',
  pr.review_title,
  pr.review_content,
  pr.created_at,
  pr.created_at
FROM inserted_reviews ir
INNER JOIN prepared_reviews pr
  ON pr.post_id = ir.post_id
 AND pr.created_at = ir.created_at;
